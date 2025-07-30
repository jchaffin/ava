/**
 * Skin Analysis API
 * 
 * IMPORTANT: This API processes images in memory only.
 * User uploads are NOT saved to disk for privacy and security.
 * Images are processed, analyzed, and then discarded from memory.
 */

import { NextRequest, NextResponse } from 'next/server';
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

    // Validate image using the service
    const validation = skinAnalysisService.validateImage(buffer);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Perform AI analysis
    const analysisResult = await skinAnalysisService.analyzeImage(buffer);

    // Generate a unique analysis ID
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return analysis results without saving to disk
    return NextResponse.json({
      success: true,
      analysisId,
      skinType: analysisResult.skinType,
      concerns: analysisResult.concerns,
      recommendations: analysisResult.recommendations,
      confidence: analysisResult.confidence,
      timestamp: new Date().toISOString(),
      message: 'Skin analysis completed successfully',
      privacy: 'Your image was processed in memory and has not been saved to disk.'
    });

  } catch (error) {
    console.error('Skin analysis error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze image. Please try again.',
        message: 'Internal server error during skin analysis'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: true,
      message: 'Skin analysis API endpoint. Use POST method with image file.',
      privacy: 'User uploads are processed in memory and are NOT saved to disk for privacy and security.',
      instructions: {
        method: 'POST',
        contentType: 'multipart/form-data',
        requiredField: 'image',
        maxFileSize: '10MB',
        supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP']
      },
      features: {
        inMemoryProcessing: true,
        noFileStorage: true,
        privacyFocused: true,
        automaticCleanup: true
      }
    },
    { status: 200 }
  );
} 