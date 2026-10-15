import { redirect, notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Note from '@/models/Note';
import { NotesWorkspace } from '@/components/NotesWorkspace';

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  try {
    await connectToDatabase();
    const note = await Note.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.userId),
    });

    if (!note) {
      notFound();
    }
  } catch (err) {
    console.error('Error loading note page:', err);
  }

  return <NotesWorkspace initialUser={session} />;
}

