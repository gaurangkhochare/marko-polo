import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Note from '@/models/Note';
import mongoose from 'mongoose';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
    const tags = await Note.distinct('tags', {
      userId: new mongoose.Types.ObjectId(session.userId),
      isArchived: false,
    });

    // Filter out any empty tags and sort alphabetically
    const cleanTags = tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).sort();

    return NextResponse.json({
      success: true,
      tags: cleanTags,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

