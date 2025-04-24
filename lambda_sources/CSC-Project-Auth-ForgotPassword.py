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
    """Handles Forgot Password (Password Reset Request)"""
    try:
        if 'body' not in event:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing request body"})}

        # Parse event body
        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        email = body.get('email')

        if not email:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing required field: email"})}

        # 🔹 Step 1: Check if user exists in DynamoDB
        user = user_table.get_item(Key={'email': email})

        if 'Item' not in user:
            return {"statusCode": 400, "body": json.dumps({"error": "User not found. Please sign up first."})}

        user_data = user['Item']

        # 🔹 Step 2: Check if user is verified
        if not user_data.get('email_verified', False):
            return {"statusCode": 400, "body": json.dumps({"error": "User is not verified. Please verify your email first."})}

        # 🔹 Step 3: Rate-limit password reset requests (e.g., 60 seconds cooldown)
        last_reset_time = user_data.get('last_reset_time', 0)
        current_time = int(time.time())

        if current_time - last_reset_time < 60:  # 60 seconds cooldown
            return {"statusCode": 429, "body": json.dumps({"error": "Too many requests. Try again later."})}

        # 🔹 Step 4: Initiate password reset using Cognito
        response = client.forgot_password(
            ClientId=AWS_COGNITO_CLIENT_ID,
            SecretHash=get_secret_hash(email),
            Username=email
        )

        # 🔹 Step 5: Update last reset timestamp in DynamoDB
        user_table.update_item(
            Key={'email': email},
            UpdateExpression="SET last_reset_time = :t",
            ExpressionAttributeValues={":t": current_time}
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": "Password reset OTP sent successfully. Check your email."})
        }

    except ClientError as e:
        return {"statusCode": 400, "body": json.dumps({"error": e.response['Error']['Message']})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": "Internal server error", "details": str(e)})}
