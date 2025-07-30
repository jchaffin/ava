# Skin Analysis API Documentation

## Overview

The Skin Analysis API provides AI-powered skin analysis capabilities for the e-commerce application. This API processes user-uploaded images to analyze skin type, identify concerns, and provide personalized product recommendations.

## 🔒 Privacy & Security

**IMPORTANT: This API is designed with privacy-first principles.**

- ✅ **No File Storage**: User uploads are processed in memory only
- ✅ **No Disk Writes**: Images are never saved to the server's file system
- ✅ **Automatic Cleanup**: Images are discarded from memory after processing
- ✅ **Secure Processing**: All analysis happens in memory and is not persisted

## API Endpoints

### GET `/api/skin-analysis`

Returns API information and usage instructions.

**Response:**
```json
{
  "success": true,
  "message": "Skin analysis API endpoint. Use POST method with image file.",
  "privacy": "User uploads are processed in memory and are NOT saved to disk for privacy and security.",
  "instructions": {
    "method": "POST",
    "contentType": "multipart/form-data",
    "requiredField": "image",
    "maxFileSize": "10MB",
    "supportedFormats": ["JPEG", "PNG", "GIF", "WebP"]
  },
  "features": {
    "inMemoryProcessing": true,
    "noFileStorage": true,
    "privacyFocused": true,
    "automaticCleanup": true
  }
}
```

### POST `/api/skin-analysis`

Analyzes a skin image and returns detailed analysis results.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field containing the image file

**Response:**
```json
{
  "success": true,
  "analysisId": "analysis_1703123456789_abc123def",
  "skinType": "combination",
  "concerns": [
    "fine lines and wrinkles",
    "uneven skin tone"
  ],
  "recommendations": [
    "Use a gentle cleanser twice daily",
    "Apply sunscreen with SPF 30+ every day"
  ],
  "confidence": 85,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "Skin analysis completed successfully",
  "privacy": "Your image was processed in memory and has not been saved to disk."
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "No image provided"
}
```

### 400 File Size Too Large
```json
{
  "success": false,
  "error": "File size too large. Please upload an image smaller than 10MB."
}
```

### 400 Invalid File Type
```json
{
  "success": false,
  "error": "Invalid file type. Please upload an image."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to analyze image. Please try again.",
  "message": "Internal server error during skin analysis"
}
```

## Usage Examples

### JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/skin-analysis', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### cURL
```bash
curl -X POST \
  -F "image=@path/to/image.jpg" \
  http://localhost:3000/api/skin-analysis
```

## Technical Details

### Image Processing
- Images are converted to Buffer in memory
- No temporary files are created
- Processing happens entirely in RAM
- Memory is automatically cleaned up after processing

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Size Limits
- Maximum file size: 10MB
- Recommended: Under 5MB for optimal performance

### Analysis Features
- Skin type detection
- Concern identification
- Personalized recommendations
- Confidence scoring
- Unique analysis tracking

## Security Considerations

1. **No Persistent Storage**: Images are never written to disk
2. **Memory Only**: All processing happens in application memory
3. **Automatic Cleanup**: Memory is freed after processing
4. **Input Validation**: File type and size validation
5. **Error Handling**: Secure error responses without data leakage

## Performance Notes

- Processing time: ~2-3 seconds (mock analysis)
- Memory usage: Temporary, proportional to image size
- No disk I/O operations
- Scalable for concurrent requests

## Development Notes

- Uses mock AI analysis for development
- Configurable for different AI providers (Google Vision, Azure, OpenAI)
- Easy to extend with additional analysis features
- Built with TypeScript for type safety 