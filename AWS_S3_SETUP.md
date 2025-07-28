# AWS S3 Asset Management Setup

This guide will help you set up AWS S3 for asset management in your AVA skincare application.

## Prerequisites

1. AWS Account
2. S3 Bucket created
3. IAM User with S3 permissions
4. (Optional) CloudFront distribution for CDN

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
```

## AWS Setup Steps

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name
4. Select your preferred region
5. Configure bucket settings:
   - Block all public access: **Uncheck** (for public images)
   - Bucket versioning: Optional
   - Server-side encryption: Enable
6. Click "Create bucket"

### 2. Configure Bucket Policy

Add this bucket policy to allow public read access for images:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### 3. Create IAM User

1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

4. Save the Access Key ID and Secret Access Key

### 4. (Optional) Set up CloudFront

1. Create a CloudFront distribution
2. Set origin domain to your S3 bucket
3. Configure caching behavior
4. Update the `AWS_CLOUDFRONT_DOMAIN` environment variable

## Features

### Image Upload
- Upload product images directly to S3
- Automatic file naming and organization
- Support for multiple image formats
- CDN integration for fast delivery

### Image Management
- View all 4 product images
- Select from existing images
- Upload new images
- Delete images from S3

### Security
- Admin-only access to image management
- Proper authentication and authorization
- Secure file uploads with validation

## File Structure

```
products/
├── {product-id}/
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   └── 4.jpg
```

## API Endpoints

- `POST /api/admin/products/[id]/images` - Upload new image
- `PUT /api/admin/products/[id]/images` - Update image configuration
- `DELETE /api/admin/products/[id]/images` - Delete images

## Usage

1. Go to Admin Products page
2. Click on any product image
3. Use the image management modal to:
   - View all 4 product images
   - Select from existing images
   - Upload new images
   - Save changes

## Troubleshooting

### Common Issues

1. **Access Denied**: Check IAM permissions and bucket policy
2. **Bucket Not Found**: Verify bucket name and region
3. **Upload Fails**: Check file size limits and CORS configuration

### CORS Configuration

If you encounter CORS issues, add this CORS configuration to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": []
    }
]
```

## Security Best Practices

1. Use IAM roles instead of access keys in production
2. Enable bucket versioning for backup
3. Set up CloudTrail for audit logging
4. Use CloudFront for content delivery
5. Implement proper file size limits
6. Validate file types before upload 