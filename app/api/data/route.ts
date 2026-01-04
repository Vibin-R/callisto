import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Category from '../../../models/Category';
import LearningItem from '../../../models/LearningItem';
import { requireAuth } from '../../../lib/middleware';

// GET all data (categories and items) - for initial load
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    await connectDB();
    
    const categories = await Category.find({ userId }).sort({ createdAt: -1 });
    
    const items = await LearningItem.find({ userId })
      .populate('categoryId', 'name color icon')
      .sort({ createdAt: -1 });

    return NextResponse.json({ categories, items });
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', categories: [], items: [] },
      { status: 500 }
    );
  }
}

