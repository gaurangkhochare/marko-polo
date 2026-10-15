import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface INoteDocument extends Document {
  title: string;
  content: string;
  userId: Types.ObjectId;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INoteDocument>(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user notes with filter and sorting
NoteSchema.index({ userId: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });
NoteSchema.index({ userId: 1, tags: 1 });
NoteSchema.index({ title: 'text', content: 'text' });

const Note: Model<INoteDocument> =
  mongoose.models.Note || mongoose.model<INoteDocument>('Note', NoteSchema);

export default Note;

