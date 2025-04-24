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
        image_ids_to_remove = set(body.get("image_ids", []))

        if not album_id or not image_ids_to_remove:
            return {"statusCode": 400, "body": json.dumps({"error": "Album ID and images are required"})}

        response = table.get_item(Key={"album_id": album_id})
        album = response.get("Item", {})
        current_images = set(album.get("image_ids", []))

        updated_images = list(current_images - image_ids_to_remove)

        table.update_item(
            Key={"album_id": album_id},
            UpdateExpression="SET image_ids = :updated_images",
            ExpressionAttributeValues={":updated_images": updated_images}
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": "Images removed from album"})
        }

    except Exception as e:
        logger.error(f"Error removing images: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
