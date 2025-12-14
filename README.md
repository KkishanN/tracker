# 📚 StudyTracker

An AI-powered study tracking application that helps you organize learning, track progress, and build intuition for complex subjects.

![Next.js](https://img.shields.io/badge/Next.js-13.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?logo=tailwind-css)

## ✨ Features

### 📖 Subject & Chapter Management
- Create and organize subjects with descriptions
- Add chapters within subjects
- Visual progress tracking with completion status
- Delete chapters with confirmation dialog

### 🧠 AI-Powered Learning
- **Generate Intuition**: AI explains concepts in simple, intuitive terms
- **Task Generation**: Automatically create study tasks from chapter content
- **Subject Overview**: High-level AI-generated summary of entire subject
- **Task Flow Transitions**: AI explains how completing one task prepares you for the next

### ⏱️ Study Timer
- Track study time per chapter
- Cute cat animation while studying 🐱
- "Meow" sound every 5 minutes as study reminder
- Study sessions saved to database

### 📊 Progress Tracking
- Dashboard with real-time statistics
- Study streak tracking (current and longest)
- Total study hours tracked
- Visual learning path map with chapter nodes

### 📁 Resource Management
- Upload PDF resources to chapters
- In-app PDF viewer (opens in dialog, not new tab)
- Resource organization per chapter


### 🔐 Authentication
- Google OAuth login via NextAuth
- Multi-user support with isolated data
- Profile section in sidebar


## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 13.5 (App Router) |
| **Language** | TypeScript |
| **Database** | SQLite (via Prisma ORM) |
| **Auth** | NextAuth.js (Google OAuth) |
| **AI** | OpenRouter API (Gemma 3 27B) |
| **Styling** | CSS + Glassmorphism design |
| **Icons** | React Icons |
| **File Storage** | Vercel Blob (for PDFs) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```env
# .env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenRouter AI
OPENROUTER_API_KEY="your-openrouter-key"

# Vercel Blob (for file uploads)
BLOB_READ_WRITE_TOKEN="your-blob-token"
```

4. Set up the database
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Sharing with ngrok
```bash
npm install -g ngrok
ngrok http 3000
```

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── page.tsx      # Main dashboard
│   │       ├── subjects/     # Subjects list & detail pages
│   │       ├── chapters/     # Chapter detail pages
│   │       └── progress/     # Progress tracking
│   ├── admin/                # Admin dashboard
│   ├── api/                  # API routes
│   │   ├── ai/               # AI endpoints (intuition, tasks, etc.)
│   │   ├── auth/             # NextAuth
│   │   └── chapters/         # Chapter CRUD
│   └── page.tsx              # Landing page
├── components/               # React components
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── StudyTimer.tsx        # Study timer with cat animation
│   ├── TaskList.tsx          # Task management
│   ├── TaskFlowMap.tsx       # Visual task learning flow
│   ├── ChapterMap.tsx        # Visual chapter map
│   ├── PdfViewer.tsx         # In-app PDF viewer
│   └── ...
└── lib/
    ├── auth.ts               # NextAuth configuration
    ├── prisma.ts             # Prisma client
    └── gemini.ts             # OpenRouter AI client
```

## 🎨 Design System

- **Theme**: Dark mode with glassmorphism
- **Colors**: 
  - Primary: Purple (#8b5cf6)
  - Secondary: Pink (#ec4899)
  - Success: Green (#22c55e)
- **Effects**: Gradient text, hover animations, click feedback

## 📝 License

MIT License - feel free to use this project for learning and personal projects.

---

Built using Next.js and AI
