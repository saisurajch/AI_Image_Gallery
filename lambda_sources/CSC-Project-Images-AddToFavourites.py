import json
import boto3
import logging

# Configure AWS clients
dynamodb = boto3.resource("dynamodb")
TABLE_NAME = "Images"

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        logger.info("Received event: %s", json.dumps(event))
        
        # Extract email from Cognito authorizer claims
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_email = claims.get('email')
        if not user_email:
            return {"statusCode": 400, "body": json.dumps({"error": "User email not found in claims"})}
        
        # Parse request body
        if "body" not in event:
            return {"statusCode": 400, "body": json.dumps({"error": "Request body is missing"})}
        
        try:
            outer_body = json.loads(event["body"])  # Parse outer body
            body = outer_body.get("body", {})  # Extract inner body
        except json.JSONDecodeError:
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON format"})}
        
        image_ids = body.get("image_ids")
        if not isinstance(image_ids, list) or not image_ids:
            return {"statusCode": 400, "body": json.dumps({"error": "Provide a list of image_ids"})}
        
        table = dynamodb.Table(TABLE_NAME)
        updated_images = []
        failed_images = []
        
        for image_id in image_ids:
            try:
                # Check if the image exists and belongs to the user
                response = table.get_item(Key={"image_id": image_id})
                item = response.get("Item")
                
                if not item:
                    failed_images.append({"image_id": image_id, "error": "Image not found"})
                    continue
                
                if item["email"] != user_email:
                    failed_images.append({"image_id": image_id, "error": "Unauthorized action"})
                    continue
                
                # Update the image to set favourite = True
                table.update_item(
                    Key={"image_id": image_id},
                    UpdateExpression="SET favourite = :val",
                    ExpressionAttributeValues={":val": True}
                )
                
                updated_images.append(image_id)
            except Exception as e:
                logger.error(f"Failed to update image {image_id}: {str(e)}")
                failed_images.append({"image_id": image_id, "error": str(e)})
        
        return {
        "statusCode": 200, 
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps({
            "message": "Batch update complete",
            "updated_images": updated_images,
            "failed_images": failed_images
        })}
        
    except Exception as e:
        logger.error("Error: %s", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}