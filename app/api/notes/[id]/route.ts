import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Note from '@/models/Note';
import { updateNoteSchema } from '@/lib/validations';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid note ID format' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error('Database connection error in GET /api/notes/[id]:', dbError);
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 503 }
    );
  }

  try {
    // Strictly isolate by userId
    const note = await Note.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.userId),
    }).lean();

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found or you do not have permission to view it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      note: {
        _id: note._id.toString(),
        title: note.title,
        content: note.content,
        userId: note.userId.toString(),
        isPinned: note.isPinned,
        isArchived: note.isArchived,
        tags: note.tags,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching note by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve note' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid note ID format' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error('Database connection error in PATCH /api/notes/[id]:', dbError);
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parseResult = updateNoteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid update data',
        },
        { status: 400 }
      );
    }

    const note = await Note.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.userId),
    });

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found or you do not have permission to modify it' },
        { status: 404 }
      );
    }

    const data = parseResult.data;
    if (data.title !== undefined) note.title = data.title;
    if (data.content !== undefined) note.content = data.content;
    if (data.tags !== undefined) note.tags = data.tags;
    if (data.isPinned !== undefined) note.isPinned = data.isPinned;
    if (data.isArchived !== undefined) note.isArchived = data.isArchived;

    await note.save();

    return NextResponse.json({
      success: true,
      note: {
        _id: note._id.toString(),
        title: note.title,
        content: note.content,
        userId: note.userId.toString(),
        isPinned: note.isPinned,
        isArchived: note.isArchived,
        tags: note.tags,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid note ID format' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error('Database connection error in DELETE /api/notes/[id]:', dbError);
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 503 }
    );
  }

  try {
    const result = await Note.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Note not found or unauthorized to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted permanently',
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}

