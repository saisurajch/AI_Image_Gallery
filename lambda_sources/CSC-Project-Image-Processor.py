import json
import boto3
import logging
from urllib.parse import unquote_plus

# AWS Clients
rekognition = boto3.client("rekognition")
dynamodb = boto3.resource("dynamodb")

# Constants
TABLE_NAME = "Images"
table = dynamodb.Table(TABLE_NAME)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        logger.info("Received S3 Event: %s", json.dumps(event))

        for record in event.get("Records", []):
            bucket_name = record["s3"]["bucket"]["name"]
            s3_key = unquote_plus(record["s3"]["object"]["key"])

            # Extract user email from S3 key format: "user_email/photos/image_id.jpg"
            parts = s3_key.split("/")
            if len(parts) < 3:
                logger.error(f"Invalid S3 key format: {s3_key}")
                continue
            user_email = parts[0]
            image_id = parts[-1]

            # Call Rekognition for label detection and text extraction
            labels = detect_labels(bucket_name, s3_key)
            text = detect_text(bucket_name, s3_key)

            # Combine extracted context
            extracted_context = labels + text
            logger.info(f"Extracted context: {extracted_context}")
            
            # Store as a JSON string instead of a list
            context_json = json.dumps(extracted_context)
            
            # Update DynamoDB with extracted context
            update_image_metadata(image_id, user_email, context_json)

        return {"statusCode": 200, "body": json.dumps({"message": "Processing complete"})}

    except Exception as e:
        logger.error(f"Error processing S3 event: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def detect_labels(bucket, key):
    """Detect labels in the image using AWS Rekognition."""
    try:
        response = rekognition.detect_labels(Image={"S3Object": {"Bucket": bucket, "Name": key}}, MaxLabels=10)
        return [label["Name"] for label in response.get("Labels", [])]
    except Exception as e:
        logger.error(f"Error detecting labels for {key}: {str(e)}")
        return []


def detect_text(bucket, key):
    """Extract text from the image using AWS Rekognition."""
    try:
        response = rekognition.detect_text(Image={"S3Object": {"Bucket": bucket, "Name": key}})
        return [text["DetectedText"] for text in response.get("TextDetections", [])]
    except Exception as e:
        logger.error(f"Error extracting text for {key}: {str(e)}")
        return []


def update_image_metadata(image_id, email, context):
    """Update DynamoDB with extracted labels and text."""
    try:
        table.update_item(
            Key={"image_id": image_id},
            UpdateExpression="SET context = :context",
            ExpressionAttributeValues={":context": context}
        )
        logger.info(f"Updated metadata for {image_id}")
    except Exception as e:
        logger.error(f"Failed to update metadata for {image_id}: {str(e)}")