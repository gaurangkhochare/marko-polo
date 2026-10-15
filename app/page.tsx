import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { NotesWorkspace } from '@/components/NotesWorkspace';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return <NotesWorkspace initialUser={session} />;
}
