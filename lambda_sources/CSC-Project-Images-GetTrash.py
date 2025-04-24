import json
import boto3
import logging

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

        # Query deleted images for the user
        response = table.scan(
            FilterExpression="email = :email AND deleted = :deleted",
            ExpressionAttributeValues={":email": user_email, ":deleted": True}
        )

        images = response.get("Items", [])
        
        # Generate signed URLs
        for image in images:
            s3_url = image.get("s3_url", "")
            s3_key = s3_url.replace(f"https://{BUCKET_NAME}.s3.amazonaws.com/", "")  # Extract S3 key
            image["signed_url"] = generate_signed_url(s3_key)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }, 
            "body": json.dumps(images)
        }

    except Exception as e:
        logger.error("Error: %s", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
