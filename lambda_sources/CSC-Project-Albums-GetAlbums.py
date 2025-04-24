import json
import boto3
import logging
import os

# AWS Clients
dynamodb = boto3.resource("dynamodb")
s3_client = boto3.client("s3")

# Table and S3 Bucket
ALBUMS_TABLE = "Albums"
IMAGES_TABLE = "Images"
S3_BUCKET_NAME = "csc-project-s3-bucket"

albums_table = dynamodb.Table(ALBUMS_TABLE)
images_table = dynamodb.Table(IMAGES_TABLE)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def generate_signed_url(s3_url):
    """Generate a pre-signed URL for an S3 object."""
    try:
        # Correctly extract the S3 object key by removing the full S3 URL prefix
        s3_prefix = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/"
        if s3_url.startswith(s3_prefix):
            s3_key = s3_url[len(s3_prefix):]  # Extract only the key
        else:
            logger.error(f"Invalid S3 URL format: {s3_url}")
            return s3_url  # Fallback to original URL

        return s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET_NAME, "Key": s3_key},
            ExpiresIn=3600,  # URL expires in 1 hour
        )
    except Exception as e:
        logger.error(f"Error generating signed URL: {str(e)}")
        return s3_url  # Fallback to original URL


def lambda_handler(event, context):
    try:
        logger.info("Received event: %s", json.dumps(event))

        params = event.get("queryStringParameters", {}) or {}
                # Extract email from Cognito claims
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        email = claims.get('email')
        if not email:
            return {"statusCode": 400, "body": json.dumps({"error": "User email not found"})}

        album_id = params.get("album_id")

        if album_id:
            # Fetch album details
            album_response = albums_table.get_item(Key={"album_id": album_id})
            album = album_response.get("Item")

            if not album:
                return {"statusCode": 404, "body": json.dumps({"error": "Album not found"})}

            # Get images belonging to this album
            image_ids = album.get("image_ids", [])
            if not image_ids:
                return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps({"album": album, "images": []})
                }

            # Fetch image details, filtering out deleted images
            image_responses = []
            for image_id in image_ids:
                response = images_table.get_item(Key={"image_id": image_id})
                image = response.get("Item")

                if image and not image.get("deleted", False):  # Exclude deleted images
                    image["signed_url"] = generate_signed_url(image["s3_url"])  # Add signed URL
                    image_responses.append(image)

            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                "body": json.dumps({"album": album, "images": image_responses}),
            }

        if not email:
            return {"statusCode": 400, "body": json.dumps({"error": "Email is required"})}

        # Fetch all albums for the user
        response = albums_table.scan(
            FilterExpression="email = :email",
            ExpressionAttributeValues={":email": email},
        )

        return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(response.get("Items", []))
        }

    except Exception as e:
        logger.error(f"Error fetching albums: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
