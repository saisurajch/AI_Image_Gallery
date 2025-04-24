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
client = boto3.client('cognito-idp', region_name=AWS_COGNITO_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_COGNITO_REGION)
user_table = dynamodb.Table('Users')

# Generate Cognito Secret Hash
def get_secret_hash(username):
    message = username + AWS_COGNITO_CLIENT_ID
    dig = hmac.new(AWS_COGNITO_CLIENT_SECRET.encode('utf-8'),
                   msg=message.encode('utf-8'), digestmod=hashlib.sha256).digest()
    return base64.b64encode(dig).decode()

# Update DynamoDB email verification status
def update_email_verified(email):
    try:
        response = user_table.update_item(
            Key={'email': email},
            UpdateExpression="SET email_verified = :val",
            ExpressionAttributeValues={':val': True},
            ConditionExpression="attribute_exists(email)"
        )
        return response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError as e:
        print("Error updating verification status:", e)
        return False

# Lambda Handler for Email Verification
def lambda_handler(event, context):
    try:
        if 'body' not in event:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing request body"})}

        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']

        if not all(k in body for k in ['email', 'otp']):
            return {"statusCode": 400, "body": json.dumps({"error": "Missing required fields: email, otp"})}

        # Confirm email verification in Cognito
        client.confirm_sign_up(
            ClientId=AWS_COGNITO_CLIENT_ID,
            SecretHash=get_secret_hash(body['email']),
            Username=body['email'],
            ConfirmationCode=body['otp']
        )

        # Update DynamoDB verification status
        if not update_email_verified(body['email']):
            return {"statusCode": 500, "body": json.dumps({"error": "Failed to update verification status."})}

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": "Email verified successfully!"})
        }

    except ClientError as e:
        return {"statusCode": 400, "body": json.dumps({"error": e.response['Error']['Message']})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": "Internal server error", "details": str(e)})}
