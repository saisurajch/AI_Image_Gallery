import json
import boto3
import logging
from collections import defaultdict
from datetime import datetime

# Configure AWS clients
dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

TABLE_NAME = "Images"
BUCKET_NAME = "csc-project-s3-bucket"
SIGNED_URL_EXPIRATION = 3600  # 1 hour

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def generate_signed_url(s3_key):
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET_NAME, "Key": s3_key},
        ExpiresIn=SIGNED_URL_EXPIRATION
    )

def lambda_handler(event, context):
    try:
        logger.info("Received event: %s", json.dumps(event))
        
        # Extract email from Cognito authorizer claims
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_email = claims.get('email')
        if not user_email:
            return {"statusCode": 400, "body": json.dumps({"error": "User email not found in claims"})}
        
        table = dynamodb.Table(TABLE_NAME)
        
        # Query favorite images by user email and filter deleted images
        response = table.scan(
            FilterExpression="email = :email AND favourite = :fav AND deleted = :deleted",
            ExpressionAttributeValues={":email": user_email, ":fav": True, ":deleted": False}
        )

        images = response.get("Items", [])

        # Group images by upload date
        grouped_favourites = defaultdict(list)
        
        for image in images:
            upload_time = image.get("upload_time", "")
            s3_url = image.get("s3_url", "")
            s3_key = s3_url.replace(f"https://{BUCKET_NAME}.s3.amazonaws.com/", "")  # Extract S3 key
            signed_url = generate_signed_url(s3_key)

            try:
                # Extract date from timestamp
                date_key = datetime.strptime(upload_time, "%Y-%m-%d %H:%M:%S.%f").date().isoformat()
            except ValueError:
                date_key = "Unknown"

            grouped_favourites[date_key].append({
                "image_id": image["image_id"],
                "signed_url": signed_url,
                "favourite": True
            })

        return {
            "statusCode": 200,
            "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps({"favourites_by_date": dict(grouped_favourites)})
        }

    except Exception as e:
        logger.error("Error: %s", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
