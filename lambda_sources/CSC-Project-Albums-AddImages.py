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

        # Extract user email from Cognito claims
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_email = claims.get('email')
        if not user_email:
            return {"statusCode": 400, "body": json.dumps({"error": "User email not found"})}

        # Extract and parse the body
        event_body = json.loads(event["body"])
        body = event_body.get("body", {})

        album_id = body.get("album_id")
        image_ids = body.get("image_ids", [])

        if not album_id or not image_ids:
            return {"statusCode": 400, "body": json.dumps({"error": "Album ID and images are required"})}

        # Fetch existing image_ids
        response = table.get_item(Key={"album_id": album_id})
        existing_images = response.get("Item", {}).get("image_ids", [])

        # Filter out duplicates
        new_images = [img for img in image_ids if img not in existing_images]

        if not new_images:
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps({"message": "No new images to add. All images already exist in the album."})
            }

        # Update DynamoDB - Append only unique images
        table.update_item(
            Key={"album_id": album_id},
            UpdateExpression="SET image_ids = list_append(image_ids, :new_images)",
            ExpressionAttributeValues={":new_images": new_images}
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"message": "Images added to album", "added_images": new_images})
        }

    except Exception as e:
        logger.error(f"Error adding images: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
