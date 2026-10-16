# Markopolo — Multi-User Markdown Notes

A production-ready, full-stack personal notes application built with **Next.js 16**, **MongoDB**, **TypeScript**, and **Tailwind CSS**. Marko Polo enables multiple users to securely register, sign in, and manage their own Markdown notes with live preview, debounced autosave, tagging, search, and strict data isolation.

Inspired by Notion, Obsidian, and Simplenote.

---

## 🌟 Key Features

- **Multi-User Authentication**:
  - Secure email/password registration and login.
  - Passwords hashed with salted **bcrypt** (`$2b$12`).
  - Secure session management using HTTP-only, SameSite cookies via signed **jose** JWTs.
  - Strict server-side ownership enforcement: notes are derived from the authenticated session; User A cannot access or modify User B's notes.

- **Markdown Editor & Live Preview**:
  - Live split-view, editor-only, and preview-only modes.
  - Full GitHub-Flavored Markdown (GFM) support: headings, bold, italic, strikethrough, blockquotes, ordered/unordered lists, nested lists, task lists/checkboxes, tables, horizontal rules, and hyperlinks.
  - Fenced code blocks with automatic syntax highlighting via `rehype-highlight`.
  - Comprehensive XSS prevention: sanitized HTML rendering with `rehype-sanitize` and strict protocol whitelisting (blocking `javascript:`, inline scripts, arbitrary iframes).
  - Safe external links (`rel="noopener noreferrer"` and `target="_blank"`).

- **Notes Management**:
  - Full CRUD: Create, Read, Update, and Delete.
  - Real-time debounced autosave with visual status indicators (**Saved**, **Saving...**, **Unsaved changes**, **Error**) and `Ctrl+S` / `Cmd+S` keyboard shortcuts.
  - Pin important notes to keep them at the top.
  - Archive/restore notes to keep the primary view clutter-free.
  - Permanent deletion with accessible confirmation modal.

- **Search, Filtering, and Sorting**:
  - Interactive search across both titles and Markdown content (debounced).
  - Tagging system: add, filter, and remove tags with `#tag` views.
  - Multiple sorting options: Recently Updated, Date Created, and Title (A-Z).

- **User Experience & Themes**:
  - Desktop 3-column layout (Sidebar navigation, Middle note list & search, Right editor & preview).
  - Responsive mobile navigation drawer and streamlined editing views.
  - Dark and Light theme support with system preference auto-detection and persistence.
  - Friendly connection alerts if MongoDB is unreachable, providing clear recovery guidance.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Partial Prerendering)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/typography`
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: JWT with [jose](https://github.com/panva/jose) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Markdown Pipeline**: [react-markdown](https://github.com/remarkjs/react-markdown), [remark-gfm](https://github.com/remarkjs/remark-gfm), [rehype-sanitize](https://github.com/rehypejs/rehype-sanitize), [rehype-highlight](https://github.com/rehypejs/rehype-highlight)
- **Validation**: [Zod 4](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Architecture

```
marko-polo/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login authentication view
│   │   └── register/page.tsx       # Registration view
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # Sign-in endpoint
│   │   │   ├── logout/route.ts     # Sign-out endpoint
│   │   │   ├── me/route.ts         # User profile endpoint
│   │   │   └── register/route.ts   # Registration endpoint
│   │   └── notes/
│   │       ├── route.ts            # Notes list (search, filter, sort) & create
│   │       ├── [id]/route.ts       # Note read, update, delete with ownership checks
│   │       └── tags/route.ts       # User tags aggregation endpoint
│   ├── archived/page.tsx           # Dedicated archived notes route
│   ├── notes/[id]/page.tsx         # Note permalink view with ownership verification
│   ├── error.tsx                   # App router error boundary
│   ├── globals.css                 # Tailwind v4 styles, theme colors, code highlight CSS
│   ├── layout.tsx                  # Root layout with fonts, metadata, and theme support
│   ├── loading.tsx                 # Loading fallback UI
│   ├── not-found.tsx               # 404 handler for missing or unauthorized notes
│   └── page.tsx                    # Main 3-column workspace (Server Component)
├── components/
│   ├── DatabaseStatusBanner.tsx    # Connection alert banner when MongoDB is offline
│   ├── DeleteConfirmDialog.tsx     # Accessible deletion modal dialog
│   ├── MarkdownPreview.tsx         # Sanitized GFM preview with syntax highlighting
│   ├── MarkdownToolbar.tsx         # Rich formatting toolbar and view mode toggles
│   ├── NoteCard.tsx                # Note card preview with tags and relative dates
│   ├── NoteEditor.tsx              # Markdown editor with autosave, tags, and actions
│   ├── NoteList.tsx                # Middle panel with search, sorting, and empty states
│   ├── NotesWorkspace.tsx          # Core interactive workspace coordinator
│   ├── Sidebar.tsx                 # Left navigation drawer, views, and tag filter list
│   ├── ThemeToggle.tsx             # Light/dark mode toggle button
│   └── UserProfileMenu.tsx         # User menu with avatar and sign out
├── lib/
│   ├── auth.ts                     # Password hashing, JWT signing/verifying, cookies
│   ├── db.ts                       # Mongoose connection with caching and timeouts
│   ├── markdown.ts                 # Safe sanitization schema and URL checks
│   └── validations.ts              # Zod input validation schemas
├── models/
│   ├── Note.ts                     # Note Mongoose model with compound indexes
│   └── User.ts                     # User Mongoose model with unique email index
├── scripts/
│   └── verify-app.ts               # Verification test suite (auth, isolation, XSS, validation)
├── types/
│   └── index.ts                    # TypeScript interface definitions
├── .env.example                    # Environment variable template
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `20.x` or `24.x`
- npm (or pnpm / yarn)
- MongoDB instance:
  - **Local**: running locally on port 27017 (`mongodb://127.0.0.1:27017/markdown_notes`)
  - **Cloud**: a free cluster from [MongoDB Atlas](https://www.mongodb.com/atlas/database)

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Adjust the values in `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/markdown_notes
AUTH_SECRET=your_super_secret_auth_token_key_minimum_32_characters_long
AUTH_URL=http://localhost:3000
```

> **Generating AUTH_SECRET**:
> You can generate a secure secret in Node with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Verification Test Suite
Ensure all security, isolation, and validation checks pass:
```bash
npm test
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build
```bash
npm run build
npm start
```

---

## 🔒 Security Design

1. **Session & Cookie Security**:
   - Sessions are signed as standard JWTs with HS256 and stored in `HttpOnly`, `SameSite=lax` cookies.
   - Cookies are marked `Secure` automatically in production environments.
2. **Server-Side Authorization**:
   - `userId` is extracted strictly from the validated server session JWT.
   - Client requests cannot spoof or inject ownership IDs.
   - Every single note operation (`GET`, `PATCH`, `DELETE`) enforces `{ _id: noteId, userId: session.userId }`.
3. **NoSQL Injection & ReDoS Protection**:
   - All inputs are parsed and validated with Zod before reaching the database.
   - Interactive search queries sanitize regex special characters to prevent regular expression denial-of-service (ReDoS).
4. **XSS Prevention**:
   - Markdown preview is passed through `rehype-sanitize` with a customized GitHub-flavored Markdown schema.
   - Arbitrary `<script>`, `<iframe>`, inline `onclick`/`onerror` handlers, and `javascript:` URIs are neutralized.

---

## 📄 License
MIT
