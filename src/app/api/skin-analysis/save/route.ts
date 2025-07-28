import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SkinAnalysis from '@/models/SkinAnalysis';
import connectDB from '@/lib/mongoose';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user ID from session
    const user = await import('@/models/User').then(m => m.default.findOne({ email: session.user.email }));
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { skinType, concerns, recommendations, confidence, imageUrl, analysisId } = body;

    // Validate required fields
    if (!skinType || !concerns || !recommendations || confidence === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new skin analysis record
    const skinAnalysis = new SkinAnalysis({
      userId: user._id,
      skinType,
      concerns,
      recommendations,
      confidence,
      imageUrl,
      analysisId: analysisId || `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    await skinAnalysis.save();

    return NextResponse.json({
      success: true,
      analysisId: skinAnalysis.analysisId,
      message: 'Analysis saved successfully'
    });

  } catch (error) {
    console.error('Error saving skin analysis:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user ID from session
    const user = await import('@/models/User').then(m => m.default.findOne({ email: session.user.email }));
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const url = new URL(request.url)
    const { searchParams } = url
    const analysisId = searchParams.get('analysisId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let analyses;

    if (analysisId) {
      // Get specific analysis
      analyses = await SkinAnalysis.findOne({ 
        analysisId, 
        userId: user._id 
      });
      
      if (!analyses) {
        return NextResponse.json(
          { error: 'Analysis not found' },
          { status: 404 }
        );
      }
    } else {
      // Get all analyses for user
      analyses = await SkinAnalysis.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(limit);
    }

    return NextResponse.json({
      success: true,
      data: analyses
    });

  } catch (error) {
    console.error('Error retrieving skin analysis:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    );
  }
} 