import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { requireAuth } from '../../../../lib/middleware';

export async function POST(request: NextRequest) {
  console.log('onboarding route',request.headers.get('authorization'));
  try {
    const authResult = requireAuth(request);
    console.log('authResult.userId',authResult.userId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    await connectDB();
    
    const { useCase } = await request.json();

    if (!useCase || !['personal', 'team', 'organization'].includes(useCase)) {
      return NextResponse.json(
        { error: 'Valid use case is required (personal, team, or organization)' },
        { status: 400 }
      );
    }

    // Update user with onboarding data
    const user = await User.findByIdAndUpdate(
      userId,
      {
        useCase,
        onboardingCompleted: true,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        useCase: user.useCase,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding', details: error.message },
      { status: 500 }
    );
  }
}

