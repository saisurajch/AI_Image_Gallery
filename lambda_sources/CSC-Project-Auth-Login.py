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

# Initialize Cognito Client
client = boto3.client('cognito-idp', region_name=AWS_COGNITO_REGION)

def get_secret_hash(username):
    """Generate the secret hash for Cognito authentication"""
    message = username + AWS_COGNITO_CLIENT_ID
    dig = hmac.new(AWS_COGNITO_CLIENT_SECRET.encode('utf-8'),
                   msg=message.encode('utf-8'), digestmod=hashlib.sha256).digest()
    return base64.b64encode(dig).decode()

def lambda_handler(event, context):
    """Handles user login request"""
    try:
        if 'body' not in event:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing request body"})}

        # Ensure event['body'] is properly parsed
        if isinstance(event['body'], str):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON format"})}
        elif isinstance(event['body'], dict):
            body = event['body']
        else:
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid request body format"})}

        if not all(k in body for k in ['email', 'password']):
            return {"statusCode": 400, "body": json.dumps({"error": "Missing required fields: email, password"})}

        email = body['email']
        password = body['password']

        # Attempt Cognito login
        try:
            response = client.initiate_auth(
                ClientId=AWS_COGNITO_CLIENT_ID,
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters={
                    "USERNAME": email,
                    "PASSWORD": password,
                    "SECRET_HASH": get_secret_hash(email)
                }
            )

            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps({
                    "message": "Login successful",
                    "id_token": response['AuthenticationResult']['IdToken'],
                    "access_token": response['AuthenticationResult']['AccessToken'],
                    "refresh_token": response['AuthenticationResult']['RefreshToken']
                })
            }

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']

            if error_code == "NotAuthorizedException":
                return {"statusCode": 401, "body": json.dumps({"error": "Invalid email or password."})}
            elif error_code == "UserNotFoundException":
                return {"statusCode": 404, "body": json.dumps({"error": "User does not exist. Please sign up first."})}
            elif error_code == "UserNotConfirmedException":
                # 🔹 User is not verified → Resend verification code
                try:
                    client.resend_confirmation_code(
                        ClientId=AWS_COGNITO_CLIENT_ID,
                        SecretHash=get_secret_hash(email),
                        Username=email
                    )
                    return {"statusCode": 403, "body": json.dumps({
                        "error": "Email not verified. A new verification code has been sent to your email."
                    })}
                except ClientError as resend_error:
                    return {"statusCode": 400, "body": json.dumps({
                        "error": "Failed to resend verification code",
                        "details": resend_error.response['Error']['Message']
                    })}
            elif error_code == "PasswordResetRequiredException":
                return {"statusCode": 403, "body": json.dumps({"error": "Password reset required. Please reset your password."})}
            else:
                return {"statusCode": 400, "body": json.dumps({"error": error_message})}

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": "Internal server error", "details": str(e)})}
