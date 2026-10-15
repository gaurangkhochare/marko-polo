import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Note from '@/models/Note';
import { createNoteSchema, queryNotesSchema } from '@/lib/validations';

/**
 * Escapes regex special characters to prevent ReDoS and regex injection
 */
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error('Database connection error in GET /api/notes:', dbError);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to database. Please check your MongoDB configuration.',
      },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const parsedQuery = queryNotesSchema.safeParse({
      q: searchParams.get('q') || undefined,
      tag: searchParams.get('tag') || undefined,
      view: searchParams.get('view') || undefined,
      sort: searchParams.get('sort') || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { q, tag, view = 'all', sort = 'updatedAt_desc' } = parsedQuery.data;

    // Strict user-scoped query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mongoQuery: Record<string, any> = {
      userId: new mongoose.Types.ObjectId(session.userId),
    };

    if (view === 'archived') {
      mongoQuery.isArchived = true;
    } else if (view === 'pinned') {
      mongoQuery.isArchived = false;
      mongoQuery.isPinned = true;
    } else {
      mongoQuery.isArchived = false;
    }

    if (tag) {
      mongoQuery.tags = tag;
    }

    if (q && q.trim().length > 0) {
      const sanitized = escapeRegex(q.trim());
      const regex = new RegExp(sanitized, 'i');
      mongoQuery.$or = [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
      ];
    }

    // Determine sorting criteria
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortCriteria: Record<string, any> = { isPinned: -1, updatedAt: -1 };
    if (sort === 'createdAt_desc') {
      sortCriteria = { isPinned: -1, createdAt: -1 };
    } else if (sort === 'title_asc') {
      sortCriteria = { title: 1 };
    }

    const notes = await Note.find(mongoQuery)
      .sort(sortCriteria)
      .lean();

    const formattedNotes = notes.map((note) => ({
      _id: note._id.toString(),
      title: note.title,
      content: note.content,
      userId: note.userId.toString(),
      isPinned: note.isPinned,
      isArchived: note.isArchived,
      tags: note.tags,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      notes: formattedNotes,
      count: formattedNotes.length,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error('Database connection error in POST /api/notes:', dbError);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to database. Please check your MongoDB configuration.',
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid note data',
        },
        { status: 400 }
      );
    }

    const { title, content, tags, isPinned, isArchived } = parseResult.data;

    // Explicit field assignment - user ID is derived strictly from server session
    const newNote = await Note.create({
      title,
      content: content || '',
      tags: tags || [],
      isPinned: !!isPinned,
      isArchived: !!isArchived,
      userId: new mongoose.Types.ObjectId(session.userId),
    });

    return NextResponse.json(
      {
        success: true,
        note: {
          _id: newNote._id.toString(),
          title: newNote.title,
          content: newNote.content,
          userId: newNote.userId.toString(),
          isPinned: newNote.isPinned,
          isArchived: newNote.isArchived,
          tags: newNote.tags,
          createdAt: newNote.createdAt.toISOString(),
          updatedAt: newNote.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

