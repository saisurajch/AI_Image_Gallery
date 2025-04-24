import json
import boto3
import logging

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

        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_email = claims.get('email')
        if not user_email:
            return {"statusCode": 400, "body": json.dumps({"error": "User email not found"})}

        body = json.loads(event["body"])
        album_id = body.get("album_id")
        if not album_id:
            return {"statusCode": 400, "body": json.dumps({"error": "Album ID is required"})}
        
        table.delete_item(Key={"album_id": album_id})

        return {
        "statusCode": 200, 
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps({"message": "Album deleted"})}

    except Exception as e:
        logger.error(f"Error deleting album: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
