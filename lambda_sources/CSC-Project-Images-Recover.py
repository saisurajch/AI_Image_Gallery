import json
import boto3
import logging

# AWS Clients
dynamodb = boto3.resource("dynamodb")

# Table Name
IMAGES_TABLE = "Images"
images_table = dynamodb.Table(IMAGES_TABLE)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        logger.info("Received event: %s", json.dumps(event))

        # Extract user email from Cognito claims
        claims = event.get("requestContext", {}).get("authorizer", {}).get("claims", {})
        user_email = claims.get("email")

        if not user_email:
            return {"statusCode": 400, "body": json.dumps({"error": "User email not found in claims"})}

        # Extract image IDs from request body
        body = json.loads(event.get("body", "{}"))
        image_ids = body.get("image_ids", [])

        if not image_ids:
            return {"statusCode": 400, "body": json.dumps({"error": "No image IDs provided"})}

        recovered_images = []

        for image_id in image_ids:
            # Get image details
            response = images_table.get_item(Key={"image_id": image_id})
            image = response.get("Item")

            # Ensure image exists and belongs to the user
            if not image or image.get("email") != user_email:
                continue

            # Check if the image is marked as deleted
            if image.get("deleted", False):
                # Update image to mark it as not deleted
                images_table.update_item(
                    Key={"image_id": image_id},
                    UpdateExpression="SET deleted = :false",
                    ExpressionAttributeValues={":false": False}
                )
                recovered_images.append(image_id)

        return {
        "statusCode": 200, 
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps({"recovered_images": recovered_images})}

    except Exception as e:
        logger.error(f"Error recovering images: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
