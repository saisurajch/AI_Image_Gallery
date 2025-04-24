
import json
import boto3
import logging
import requests
from collections import defaultdict
from datetime import datetime

# AWS Clients
dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

# Configuration
TABLE_NAME = "Images"
BUCKET_NAME = "csc-project-s3-bucket"
SIGNED_URL_EXPIRATION = 3600  # 1 hour
OPENSEARCH_ENDPOINT = ""
INDEX_NAME = "event-data-index"

# Optional: If basic authentication is enabled on OpenSearch
OPENSEARCH_USERNAME = ""  # Change this if required
OPENSEARCH_PASSWORD = ""  # Change this if required

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def generate_signed_url(s3_key):
    """Generates a signed URL for S3 object access."""
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET_NAME, "Key": s3_key},
        ExpiresIn=SIGNED_URL_EXPIRATION
    )

def search_images_in_opensearch(user_email, search_query):
    """Search images using OpenSearch (without boto3, only requests)."""
    query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"email": user_email}},  # Filter by user email
                    {"match": {"context": search_query}},  # Search in context
                    {"match": {"deleted": False}}  # Exclude deleted images
                ]
            }
        }
    }

    url = f"{OPENSEARCH_ENDPOINT}/{INDEX_NAME}/_search"

    try:
        response = requests.post(
            url,
            json=query,
            headers={"Content-Type": "application/json"},
            auth=(OPENSEARCH_USERNAME, OPENSEARCH_PASSWORD)  # Optional, remove if not needed
        )
        response.raise_for_status()
        search_results = response.json()

        return [hit["_source"] for hit in search_results.get("hits", {}).get("hits", [])]

    except requests.RequestException as e:
        logger.error(f"OpenSearch query failed: {e}")
        return []

def get_images_from_dynamodb(user_email):
    """Fetch all images from DynamoDB for the user."""
    table = dynamodb.Table(TABLE_NAME)

    response = table.scan(
        FilterExpression="email = :email AND deleted = :deleted",
        ExpressionAttributeValues={":email": user_email, ":deleted": False}
    )

    return response.get("Items", [])

def lambda_handler(event, context):
    try:
        logger.info("Received event: %s", json.dumps(event))
        
        # Extract email from Cognito authorizer claims
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_email = claims.get('email')
        if not user_email:
            return {"statusCode": 400, "body": json.dumps({"error": "User email not found in claims"})}

        # Extract query parameter (if any)
        query_params = event.get("queryStringParameters", {}) or {}
        search_query = query_params.get("query")

        # Fetch images based on query or get all
        images = search_images_in_opensearch(user_email, search_query) if search_query else get_images_from_dynamodb(user_email)

        # Group images by upload date
        grouped_photos = defaultdict(list)
        
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

            grouped_photos[date_key].append({
                "image_id": image["image_id"],
                "signed_url": signed_url,
                "favourite": image["favourite"]
            })

        return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps({"photos_by_date": dict(grouped_photos)})}

    except Exception as e:
        logger.error("Error: %s", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
