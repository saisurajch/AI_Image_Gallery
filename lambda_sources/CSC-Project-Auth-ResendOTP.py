import json
import boto3
import hmac
import hashlib
import base64
import time
from botocore.exceptions import ClientError

# AWS Configuration
AWS_COGNITO_CLIENT_ID = ''
AWS_COGNITO_REGION = 'us-east-1'
AWS_COGNITO_CLIENT_SECRET = ''
DYNAMODB_TABLE_NAME = 'Users'  # Change to your DynamoDB table

# Initialize AWS Clients
client = boto3.client('cognito-idp', region_name=AWS_COGNITO_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_COGNITO_REGION)
user_table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def get_secret_hash(username):
    """Generate the secret hash for Cognito authentication"""
    message = username + AWS_COGNITO_CLIENT_ID
    dig = hmac.new(AWS_COGNITO_CLIENT_SECRET.encode('utf-8'),
                   msg=message.encode('utf-8'), digestmod=hashlib.sha256).digest()
    return base64.b64encode(dig).decode()

def lambda_handler(event, context):
    """Handles resending OTP for user verification"""
    try:
        if 'body' not in event:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing request body"})}

        # Parse event body
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        email = body.get('email')

        if not email:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing required field: email"})}

        # 🔹 Step 1: Check if user exists in Cognito
        try:
            cognito_response = client.admin_get_user(
                UserPoolId='us-east-1_dlUo0SLVg',  # Replace with your Cognito User Pool ID
                Username=email
            )
            user_attributes = {attr['Name']: attr['Value'] for attr in cognito_response['UserAttributes']}

            # Check if the email is already verified
            if user_attributes.get('email_verified', 'false') == 'true':
                return {"statusCode": 409, "body": json.dumps({"error": "User is already verified. Please log in."})}
        except client.exceptions.UserNotFoundException:
            return {"statusCode": 404, "body": json.dumps({"error": "User not found. Please sign up."})}

        # 🔹 Step 2: Check last OTP request timestamp in DynamoDB
        user = user_table.get_item(Key={'email': email})
        user_data = user.get('Item', {})

        last_otp_time = user_data.get('last_otp_time', 0)
        current_time = int(time.time())

        if current_time - last_otp_time < 60:  # 60 seconds cooldown
            return {"statusCode": 429, "body": json.dumps({"error": "Too many requests. Try again later."})}

        # 🔹 Step 3: Resend OTP using Cognito
        client.resend_confirmation_code(
            ClientId=AWS_COGNITO_CLIENT_ID,
            SecretHash=get_secret_hash(email),
            Username=email
        )

        # 🔹 Step 4: Update last OTP timestamp in DynamoDB (use conditional expression)
        user_table.update_item(
            Key={'email': email},
            UpdateExpression="SET last_otp_time = :t",
            ConditionExpression="attribute_exists(email)",  # Prevents creating new records
            ExpressionAttributeValues={":t": current_time}
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": "OTP resent successfully. Check your email."})
        }

    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == "LimitExceededException":
            return {"statusCode": 429, "body": json.dumps({"error": "OTP request limit exceeded. Try again later."})}
        elif error_code == "UserNotFoundException":
            return {"statusCode": 404, "body": json.dumps({"error": "User not found. Please sign up."})}
        elif error_code == "NotAuthorizedException":
            return {"statusCode": 403, "body": json.dumps({"error": "User is disabled or unauthorized."})}
        else:
            return {"statusCode": 400, "body": json.dumps({"error": e.response['Error']['Message']})}

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": "Internal server error", "details": str(e)})}
