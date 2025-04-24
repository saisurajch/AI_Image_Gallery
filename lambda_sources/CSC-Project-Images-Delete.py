import json
import boto3
import logging

# AWS Clients
dynamodb = boto3.resource("dynamodb")

# Constants
TABLE_NAME = "Images"
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
            return {"statusCode": 400, "body": json.dumps({"error": "User email not found in claims"})}

        # Parse request body
        if "body" not in event:
            return {"statusCode": 400, "body": json.dumps({"error": "Request body is missing"})}

        try:
            body = json.loads(event["body"])  # Parse outer body
            inner_body = body.get("body", {})  # Extract inner body
        except json.JSONDecodeError:
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON format"})}

        # Validate images
        image_ids = inner_body.get("image_ids", [])
        if not isinstance(image_ids, list) or len(image_ids) < 1:
            return {"statusCode": 400, "body": json.dumps({"error": "Please provide at least one image_id"})}

        deleted_images = []
        failed_images = []

        for image_id in image_ids:
            try:
                # Update the image entry in DynamoDB to mark it as deleted
                response = table.update_item(
                    Key={"image_id": image_id},
                    UpdateExpression="SET deleted = :deleted",
                    ConditionExpression="email = :email",
                    ExpressionAttributeValues={
                        ":deleted": True,
                        ":email": user_email
                    }
                )
                deleted_images.append(image_id)
            except Exception as e:
                logger.error(f"Failed to delete image {image_id}: {str(e)}")
                failed_images.append({"image_id": image_id, "error": str(e)})

        response = {
            "message": "Soft delete process complete",
            "deleted_images": deleted_images,
            "failed_images": failed_images
        }
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }, 
            "body": json.dumps(response)
        }

    except Exception as e:
        logger.error("Error: %s", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
