import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name cannot exceed 50 characters' }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100, { message: 'Password cannot exceed 100 characters' }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required' })
    .max(200, { message: 'Title cannot exceed 200 characters' }),
  content: z
    .string()
    .max(100000, { message: 'Note content cannot exceed 100,000 characters' })
    .default(''),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(30)
    )
    .max(20, { message: 'Cannot have more than 20 tags' })
    .default([]),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title cannot be empty' })
    .max(200, { message: 'Title cannot exceed 200 characters' })
    .optional(),
  content: z
    .string()
    .max(100000, { message: 'Note content cannot exceed 100,000 characters' })
    .optional(),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(30)
    )
    .max(20, { message: 'Cannot have more than 20 tags' })
    .optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const queryNotesSchema = z.object({
  q: z.string().trim().max(100).optional(),
  tag: z.string().trim().max(30).optional(),
  view: z.enum(['all', 'pinned', 'archived']).optional(),
  sort: z.enum(['updatedAt_desc', 'createdAt_desc', 'title_asc']).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type QueryNotesInput = z.infer<typeof queryNotesSchema>;

