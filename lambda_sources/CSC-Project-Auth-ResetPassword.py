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
    """Handles Reset Password after user provides OTP"""
    try:
        if 'body' not in event:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing request body"})}

        # Parse event body
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        email = body.get('email')
        otp = body.get('otp')
        new_password = body.get('new_password')

        if not all([email, otp, new_password]):
            return {"statusCode": 400, "body": json.dumps({"error": "Missing required fields: email, otp, new_password"})}

        # 🔹 Step 1: Check if user exists in DynamoDB
        user = user_table.get_item(Key={'email': email})

        if 'Item' not in user:
            return {"statusCode": 400, "body": json.dumps({"error": "User not found. Please sign up first."})}

        user_data = user['Item']

        # 🔹 Step 2: Check if user is verified
        if not user_data.get('email_verified', False):
            return {"statusCode": 400, "body": json.dumps({"error": "User is not verified. Please verify your email first."})}

        # 🔹 Step 3: Reset Password using Cognito
        response = client.confirm_forgot_password(
            ClientId=AWS_COGNITO_CLIENT_ID,
            SecretHash=get_secret_hash(email),
            Username=email,
            ConfirmationCode=otp,
            Password=new_password
        )

        # 🔹 Step 4: Update password reset timestamp in DynamoDB (optional logging)
        user_table.update_item(
            Key={'email': email},
            UpdateExpression="SET last_password_reset_time = :t",
            ExpressionAttributeValues={":t": int(time.time())}
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": "Password reset successful. You can now log in with your new password."})
        }

    except ClientError as e:
        return {"statusCode": 400, "body": json.dumps({"error": e.response['Error']['Message']})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": "Internal server error", "details": str(e)})}
