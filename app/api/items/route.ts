import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import LearningItem from '../../../models/LearningItem';
import { ITopic } from '../../../models/LearningItem';

import { requireAuth } from '../../../lib/middleware';

// GET all items
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    await connectDB();
    const items = await LearningItem.find({ userId })
      .populate('categoryId', 'name color icon')
      .sort({ createdAt: -1 });
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items', items: [] },
      { status: 500 }
    );
  }
}

// POST create new item
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    await connectDB();
    const { categoryId, name, description, topics } = await request.json();

    if (!categoryId || !name) {
      return NextResponse.json(
        { error: 'Category ID and name are required' },
        { status: 400 }
      );
    }

    const item = await LearningItem.create({
      userId,
      categoryId,
      name,
      description: description || '',
      topics: topics || [],
      status: 'Not started',
      comments: '',
    });

    await item.populate('categoryId', 'name color icon');

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

