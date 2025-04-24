import json
import boto3
import logging
import uuid

# AWS Clients
dynamodb = boto3.resource("dynamodb")
TABLE_NAME = "Albums"
table = dynamodb.Table(TABLE_NAME)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        logger.info("Received event: %s", json.dumps(event))
        
        # Extract email from Cognito claims
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_email = claims.get('email')
        if not user_email:
            return {"statusCode": 400, "body": json.dumps({"error": "User email not found"})}
        
        # Parse the nested body
        raw_body = json.loads(event["body"])  # First parse
        body = raw_body.get("body")           # Extract the inner body
        if isinstance(body, str):             
            body = json.loads(body)           # Parse again if it's a string

        # Validate album_name
        album_name = body.get("album_name")
        if not album_name:
            return {"statusCode": 400, "body": json.dumps({"error": "Album name is required"})}
        
        album_id = str(uuid.uuid4())  # Unique album ID

        # Insert into DynamoDB
        table.put_item(Item={
            "album_id": album_id,
            "email": user_email,
            "album_name": album_name,
            "image_ids": []
        })

        return {
        "statusCode": 201,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps({"message": "Album created", "album_id": album_id})
        }

    except Exception as e:
        logger.error(f"Error creating album: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
