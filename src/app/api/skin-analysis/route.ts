import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { skinAnalysisService } from '@/lib/ai-analysis';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Please upload an image smaller than 10MB.' },
        { status: 400 }
      );
    }

    // Convert image to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `skin-analysis-${timestamp}-${image.name}`;
    const filepath = join(uploadsDir, filename);

    // Save image to disk
    await writeFile(filepath, buffer);

    // Validate image
    const validation = skinAnalysisService.validateImage(buffer);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Perform AI analysis
    const analysisResult = await skinAnalysisService.analyzeImage(buffer);

    // Return analysis results
    return NextResponse.json({
      ...analysisResult,
      imageUrl: `/uploads/${filename}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Skin analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Skin analysis API endpoint. Use POST method with image file.' },
    { status: 200 }
  );
} 