# LifeOS — Personal Productivity & AI Life Assistant

LifeOS unifies tasks, notes, reminders, schedules, and documents into one intelligent workspace with autonomous multi-LLM daily planning. Engineered by **AnOS**.

---

## ⚡ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Material Symbols & Lucide Icons
- **Backend**: Next.js API Routes (Serverless)
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Authentication**: NextAuth.js (Credentials with bcrypt hashing + Google OAuth)
- **Firebase Suite**: Firebase SDK, Firestore Database (`firestore.rules`), Realtime Database (`database.rules.json`), Analytics
- **AI Engine**: Multi-LLM provider router supporting OpenRouter (`openai/gpt-4o-mini`), Groq (`groq/compound-mini`), Anthropic Claude, and rule-based scheduling fallback.
- **Design System**: Modern SaaS UI with 3D iPhone showcase, interactive bento grid, and AnOS brand tokens.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="lifeos_super_secret_jwt_key_2026"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider Keys
GROQ_API_KEY=""
OPENROUTER_API_KEY=""
ANTHROPIC_API_KEY=""

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=""
```

### 3. Initialize Database & Seed Demo Data
```bash
npx prisma db push
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🔑 Demo Account Credentials
- **Email**: `demo@lifeos.local`
- **Password**: `password123`
*(Or click **"Launch Demo Workspace"** on `/login`)*

---

## 🌟 Core Modules

1. **All-in-One Dashboard**:
   - Live greeting & focus window status.
   - **Today's Priorities**: Incomplete tasks sorted by priority (HIGH/MEDIUM/LOW) with custom ring checkboxes and status tags.
   - **Autonomous AI Day Planner**: Generates conflict-free focus blocks with transparent reasoning.
   - **Upcoming Agenda**: Upcoming calendar events and due dates.
   - **Quick Action Bar**: Modal shortcuts for Tasks, Notes, Reminders, Events, and Documents.

2. **Tasks Module**:
   - Filter by All / Today / Upcoming / Completed.
   - Priority tagging (HIGH, MEDIUM, LOW), progress tracking, and due date countdowns.

3. **Notes & Semantic Memory**:
   - Full CRUD note editor with tag-based filtering and instant search.

4. **Reminders Module**:
   - One-time and recurring reminders (Daily, Weekly, Monthly, Hourly) with in-app due alert toasts.

5. **Calendar & Schedules**:
   - Month & Week view navigation with colored time blocks and event management.

6. **Settings & Data Governance**:
   - Configurable study/focus hours (`studyHoursStart` – `studyHoursEnd`) and timezone.
   - Full JSON dump data export.
   - Permanent account deletion controls.

---

## 🔒 Privacy & Security
- All database queries are strictly scoped by `userId` — absolute multi-tenant data isolation.
- Passwords cryptographically hashed with bcrypt.
- Cloud Firestore and Realtime Database secured by `firestore.rules` and `database.rules.json`.
- All AI processing executes strictly server-side with zero client-side key exposure.
