export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          Loading workspace...
        </p>
      </div>
    </div>
  );
}

