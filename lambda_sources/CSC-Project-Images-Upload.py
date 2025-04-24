import json
import boto3
import uuid
import datetime
import base64
import logging

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

BUCKET_NAME = "csc-project-s3-bucket"
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
            body = json.loads(event["body"])  # Parse outer body
            inner_body = body.get("body", {})  # Extract inner body
        except json.JSONDecodeError:
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON format"})}

        # Validate images
        images = inner_body.get("images", [])
        if not isinstance(images, list) or len(images) < 1 or len(images) > 25:
            return {"statusCode": 400, "body": json.dumps({"error": "Please provide between 1 to 25 images"})}

        table = dynamodb.Table(TABLE_NAME)
        uploaded_images = []
        failed_images = []

        for idx, image_data_base64 in enumerate(images):
            try:
                image_data = base64.b64decode(image_data_base64)
                image_id = str(uuid.uuid4()) + ".jpg"
                s3_key = f"{user_email}/photos/{image_id}"

                # Upload image to S3
                s3.put_object(Bucket=BUCKET_NAME, Key=s3_key, Body=image_data, ContentType="image/jpeg")

                image_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
                upload_time = str(datetime.datetime.utcnow())

                # Store metadata in DynamoDB
                table.put_item(Item={
                    "image_id": image_id,
                    "email": user_email,
                    "s3_url": image_url,
                    "upload_time": upload_time,
                    "favourite": False,
                    "albums": [],
                    "deleted": False
                })

                uploaded_images.append({"image_id": image_id, "image_url": image_url})

            except Exception as e:
                logger.error(f"Failed to process image {idx + 1}: {str(e)}")
                failed_images.append({"image_index": idx + 1, "error": str(e)})

        response = {
            "message": "Batch image upload complete",
            "uploaded_images": uploaded_images,
            "failed_images": failed_images,
        }
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps(response)
        }

    except Exception as e:
        logger.error("Error: %s", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
