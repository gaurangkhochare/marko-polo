'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { NoteList } from '@/components/NoteList';
import { NoteEditor } from '@/components/NoteEditor';
import { DatabaseStatusBanner } from '@/components/DatabaseStatusBanner';
import { AuthSession, INote, NoteSortOption, NoteViewMode } from '@/types';

interface NotesWorkspaceProps {
  initialUser: AuthSession;
}

export function NotesWorkspace({ initialUser }: NotesWorkspaceProps) {
  const [notes, setNotes] = useState<INote[]>([]);
  const [selectedNote, setSelectedNote] = useState<INote | null>(null);
  const [activeView, setActiveView] = useState<NoteViewMode>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState<NoteSortOption>('updatedAt_desc');

  const [tags, setTags] = useState<string[]>([]);
  const [counts, setCounts] = useState({ all: 0, pinned: 0, archived: 0 });

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isRetryingDb, setIsRetryingDb] = useState(false);

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch tags for current user
  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/notes/tags');
      const data = await res.json();
      if (data.success && Array.isArray(data.tags)) {
        setTags(data.tags);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  }, []);

  // Fetch counts across all categories
  const fetchCounts = useCallback(async () => {
    try {
      const [allRes, pinnedRes, archivedRes] = await Promise.all([
        fetch('/api/notes?view=all'),
        fetch('/api/notes?view=pinned'),
        fetch('/api/notes?view=archived'),
      ]);

      const [allData, pinnedData, archivedData] = await Promise.all([
        allRes.json(),
        pinnedRes.json(),
        archivedRes.json(),
      ]);

      setCounts({
        all: allData.notes?.length || 0,
        pinned: pinnedData.notes?.length || 0,
        archived: archivedData.notes?.length || 0,
      });
    } catch (err) {
      console.error('Fetch counts error:', err);
    }
  }, []);

  // Fetch notes from server with current filters and query
  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setDbError(null);

    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (selectedTag) params.set('tag', selectedTag);
      params.set('view', activeView);
      params.set('sort', sortOption);

      const res = await fetch(`/api/notes?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setDbError(data.error || 'Cannot connect to MongoDB.');
        }
        setIsLoading(false);
        return;
      }

      if (data.success && Array.isArray(data.notes)) {
        setNotes(data.notes);

        setSelectedNote((current) => {
          if (!current && data.notes.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
            return data.notes[0];
          }
          if (current) {
            const found = data.notes.find((n: INote) => n._id === current._id);
            return found || (data.notes.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768 ? data.notes[0] : null);
          }
          return null;
        });
      }
    } catch (err) {
      console.error('Fetch notes error:', err);
      setDbError('Network or database error while loading notes.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedTag, activeView, sortOption]);

  // Initial load and filter change trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotes();
      fetchTags();
      fetchCounts();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadNotes, fetchTags, fetchCounts]);

  // Handle creating a new note
  const handleCreateNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          tags: selectedTag ? [selectedTag] : [],
        }),
      });

      const data = await res.json();
      if (data.success && data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setSelectedNote(data.note);
        setIsMobileEditorOpen(true);
        fetchCounts();
        fetchTags();
      } else {
        alert(data.error || 'Failed to create note');
      }
    } catch (err) {
      console.error('Create note error:', err);
      alert('Network error while creating note');
    }
  };

  // Handle updating note
  const handleUpdateNote = async (
    updatedFields: Partial<INote> & { _id: string }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/notes/${updatedFields._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();
      if (data.success && data.note) {
        const savedNote: INote = data.note;

        setNotes((prev) => {
          if (activeView === 'archived' && !savedNote.isArchived) {
            return prev.filter((n) => n._id !== savedNote._id);
          }
          if (activeView === 'pinned' && (!savedNote.isPinned || savedNote.isArchived)) {
            return prev.filter((n) => n._id !== savedNote._id);
          }
          if (activeView === 'all' && savedNote.isArchived) {
            return prev.filter((n) => n._id !== savedNote._id);
          }
          return prev.map((n) => (n._id === savedNote._id ? savedNote : n));
        });

        setSelectedNote((current) =>
          current?._id === savedNote._id ? savedNote : current
        );

        fetchCounts();
        fetchTags();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update note error:', err);
      return false;
    }
  };

  // Handle deleting note
  const handleDeleteNote = async (noteId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setNotes((prev) => {
          const filtered = prev.filter((n) => n._id !== noteId);
          if (selectedNote?._id === noteId) {
            setSelectedNote(filtered.length > 0 ? filtered[0] : null);
            setIsMobileEditorOpen(false);
          }
          return filtered;
        });

        fetchCounts();
        fetchTags();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Delete note error:', err);
      return false;
    }
  };

  const handleSelectNote = (note: INote) => {
    setSelectedNote(note);
    setIsMobileEditorOpen(true);
  };

  const handleRetryDb = async () => {
    setIsRetryingDb(true);
    await loadNotes();
    await fetchCounts();
    await fetchTags();
    setIsRetryingDb(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-slate-950">
      {/* MongoDB connection alert banner if offline */}
      <DatabaseStatusBanner
        error={dbError}
        onRetry={handleRetryDb}
        isRetrying={isRetryingDb}
      />

      <div className="flex flex-1 h-full overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          user={initialUser}
          activeView={activeView}
          onSelectView={setActiveView}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          tags={tags}
          counts={counts}
          onCreateNote={handleCreateNote}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Middle Panel: Note List */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
            isMobileEditorOpen ? 'hidden md:block' : 'block'
          }`}
        >
          <NoteList
            notes={notes}
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
            activeView={activeView}
            selectedTag={selectedTag}
            isLoading={isLoading}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onCreateNote={handleCreateNote}
          />
        </div>

        {/* Right Panel: Note Editor / Preview */}
        <div
          className={`flex-1 h-full overflow-hidden ${
            !isMobileEditorOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          <NoteEditor
            key={selectedNote?._id || 'none'}
            note={selectedNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onBackToList={() => setIsMobileEditorOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

