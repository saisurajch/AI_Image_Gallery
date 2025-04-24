import json
import boto3
import hmac
import hashlib
import base64
from botocore.exceptions import ClientError

# AWS Cognito Configuration
AWS_COGNITO_USER_POOL_ID = ''
AWS_COGNITO_CLIENT_ID = ''
AWS_COGNITO_REGION = 'us-east-1'
AWS_COGNITO_CLIENT_SECRET = ''

# Initialize AWS Clients
cognito_client = boto3.client('cognito-idp', region_name=AWS_COGNITO_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_COGNITO_REGION)
user_table = dynamodb.Table('Users')

# Generate Cognito Secret Hash
def get_secret_hash(username):
    message = username + AWS_COGNITO_CLIENT_ID
    dig = hmac.new(AWS_COGNITO_CLIENT_SECRET.encode('utf-8'),
                   msg=message.encode('utf-8'), digestmod=hashlib.sha256).digest()
    return base64.b64encode(dig).decode()

# Check if user exists in DynamoDB
def user_exists(email):
    try:
        response = user_table.get_item(Key={'email': email})
        return 'Item' in response
    except Exception as e:
        print("Error checking user existence:", e)
        return False

# Store user in DynamoDB
def create_user(name, email, password):
    try:

        response = user_table.put_item(
            Item={
                "email": email,
                "name": name,
                "email_verified": False  # Flag for verification status
            },
            ConditionExpression="attribute_not_exists(email)"
        )
        return response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return False
        print("Error creating user in DynamoDB:", e)
        return False

# Lambda Function for User Signup
def lambda_handler(event, context):
    try:
        if 'body' not in event:
            raise ValueError("Request body is missing")

        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']

        required_fields = ['email', 'password', 'name']
        for field in required_fields:
            if field not in body or not body[field]:
                raise ValueError(f"Missing required field: {field}")

        email, name, password = body['email'], body['name'], body['password']

        # Check user existence in DynamoDB
        if user_exists(email):
            return {"statusCode": 409, "body": json.dumps({"error": "User already exists. Please log in."})}

        # Store user in DynamoDB
        if not create_user(name, email, password):
            return {"statusCode": 409, "body": json.dumps({"error": "User already exists. Please log in."})}

        # Sign up in AWS Cognito
        cognito_client.sign_up(
            ClientId=AWS_COGNITO_CLIENT_ID,
            SecretHash=get_secret_hash(email),
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': name},
            ]
        )

        return {
            "status": 201, 
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": "User signed up successfully. Please verify your email."})
        }

    except ValueError as e:
        return {"statusCode": 400, "body": json.dumps({"error": str(e)})}
    except ClientError as e:
        return {"statusCode": 400, "body": json.dumps({"error": e.response['Error']['Message']})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": "Internal server error", "details": str(e)})}
