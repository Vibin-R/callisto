import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  console.log('getUserIdFromRequest',request.headers.get('authorization'));
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  return payload.userId;
}

export function requireAuth(request: NextRequest): { userId: string } | NextResponse {
  console.log('requireAuth');
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return { userId };
}

