export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface INote {
  _id: string;
  title: string;
  content: string;
  userId: string;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
}

export type NoteSortOption = 'updatedAt_desc' | 'createdAt_desc' | 'title_asc';

export type NoteViewMode = 'all' | 'pinned' | 'archived';

export interface NotesQueryFilters {
  q?: string;
  tag?: string;
  view?: NoteViewMode;
  sort?: NoteSortOption;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

