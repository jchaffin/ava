# Database Seeder

This directory contains the database seeder for the AVA skincare application.

## Usage

To seed the database with sample data, run:

```bash
npm run seed
```

## What Gets Seeded

### Products (8 items)
- **Hydrating Serum** - $49.99 (Featured)
- **Vitamin C Serum** - $59.99 (Featured)
- **Collagen Serum** - $69.99 (Featured)
- **Anti-Age Serum** - $79.99 (Featured)
- **Brightening Serum** - $54.99
- **Soothing Serum** - $44.99
- **Intensive Serum** - $64.99
- **Hyaluronic Serum** - $39.99

### Users (2 accounts)
- **Admin User**
  - Email: `admin@ava.com`
  - Password: `admin123`
  - Role: `admin`

- **Test User**
  - Email: `test@ava.com`
  - Password: `test123`
  - Role: `user`

## Categories

The seeder creates products in these categories:
- **Hydration** - Moisturizing and hydrating products
- **Brightening** - Products that even skin tone and reduce dark spots
- **Anti-Aging** - Products that target fine lines and wrinkles
- **Sensitive** - Gentle products for sensitive skin
- **Treatment** - Intensive treatment products

## Features

- ✅ Clears existing data before seeding
- ✅ Creates realistic product descriptions
- ✅ Sets appropriate stock levels
- ✅ Marks featured products
- ✅ Creates admin and test user accounts
- ✅ Provides detailed console output
- ✅ Handles errors gracefully

## Environment Variables Required

Make sure you have these environment variables set in your `.env.local`:

```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Notes

- The seeder will clear all existing products and the specified test users
- Passwords are properly hashed using bcrypt
- Product images reference the existing image files in `/public/images/products/[id]/`
- Each product uses its specific main image file (e.g., `hydserum_main.jpg`, `vitcserum_main.jpg`)
- Featured products are marked for display on the homepage 