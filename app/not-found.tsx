import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 text-slate-400">
        <FileQuestion className="w-8 h-8 stroke-1" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Note Not Found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        The note you are looking for doesn&apos;t exist, has been removed, or you don&apos;t have permission to access it.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Workspace</span>
      </Link>
    </div>
  );
}

