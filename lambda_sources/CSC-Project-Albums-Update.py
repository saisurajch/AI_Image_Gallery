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
        new_name = body.get("new_name")
        if not album_id or not new_name:
            return {"statusCode": 400, "body": json.dumps({"error": "Album ID and new name are required"})}
        
        table.update_item(
            Key={"album_id": album_id},
            UpdateExpression="SET album_name = :new_name",
            ExpressionAttributeValues={":new_name": new_name}
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": "Album updated"})
        }

    except Exception as e:
        logger.error(f"Error updating album: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
