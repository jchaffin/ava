# Public Directory Structure

This directory contains all static assets for the AVA e-commerce application.

## Directory Structure

```
public/
├── assets/                 # Static assets
│   ├── icons/             # SVG icons and small graphics
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── window.svg
│   │   └── file.svg
│   └── logo.png           # Main application logo
├── images/                # Image assets
│   ├── content/           # Content images (about, home, etc.)
│   ├── products/          # Product images (organized by product ID)
│   ├── gallery/           # Gallery images
│   ├── home/              # Homepage specific images
│   ├── info/              # Information page images
│   └── logos/             # Logo variations
├── models/                # AI/ML models
│   ├── tiny_face_detector_model-weights_manifest.json
│   └── tiny_face_detector_model-shard1
└── uploads/               # User uploaded files (empty by default)
```

## Organization Rules

### Product Images
- Product images are stored in `images/products/{productId}/`
- Each product has its own directory named with the product's MongoDB ID
- Images within each product directory follow the naming convention:
  - `main.jpg` - Main product image
  - `2.jpg`, `3.jpg`, `4.jpg` - Additional product images

### Content Images
- General content images are stored in `images/content/`
- Includes about pages, home page images, disclosures, etc.

### Static Assets
- Icons and small graphics go in `assets/icons/`
- Main logo goes in `assets/`
- All SVG files are in `assets/icons/`

### Uploads
- User-uploaded content goes in `uploads/`
- This directory is empty by default and populated as needed

## Maintenance

- Keep product images organized by product ID
- Use descriptive names for content images
- Remove unused images regularly
- Maintain consistent naming conventions 