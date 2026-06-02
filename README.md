# 🎓 Incipio — Premium Internship Management Platform

> A high-fidelity, full-stack university internship coordination and career pipeline management system with real-time synchronization, role-based access, PDF resume handling, and a rich messaging inbox.

---

## 📋 Table of Contents

1. [Tech Stack](#-tech-stack)
2. [Features](#-features)
3. [PDF Resume Storage — How It Works](#-pdf-resume-storage--how-it-works)
4. [Application Code Flow](#-application-code-flow)
5. [Project Structure](#-project-structure)
6. [API Reference](#-api-reference)
7. [Getting Started](#-getting-started)
8. [Environment Variables](#-environment-variables)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript |
| **Bundler / Dev Server** | Vite 6 |
| **Styling** | Tailwind CSS v4 (custom HSL palette — Forest Obsidian, Pristine Teal, Warm Linen) |
| **Icons** | Lucide React |
| **Backend Runtime** | Node.js + Express |
| **Database** | MongoDB via Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs password hashing |
| **File Uploads** | Multer (disk storage, PDF-only filter, 5 MB cap) |
| **Concurrency** | `concurrently` — runs frontend + backend in one terminal |

---

## ✨ Features

### 🔐 Authentication System
- **Register** as a `Student`, `Company` (Recruiter), or `Admin`.
- Passwords are hashed with **bcrypt (salt rounds: 10)** before storage — never stored in plain text.
- On login, a signed **JWT (7-day expiry)** is issued and persisted in `localStorage`.
- Every subsequent API request includes the token via `Authorization: Bearer <token>` header.
- On app load, `GET /api/auth/me` revalidates the session token silently; if invalid/expired, the user is logged out.

### 🏢 Role-Based Views
Three distinct user roles, each with a tailored portal:

| Role | Capabilities |
|---|---|
| **Student** | Browse & apply to listings, track application status, upload resume PDF, send/receive messages, manage profile |
| **Company** | Post & delete internship listings, view all applicants in the Candidate Tracker, update application statuses, send messages |
| **Admin** | Full access — all of the above plus user management (invite, role-change, delete) |

### 📋 Internship Listings
- **Public browsing** — listings are fetched without authentication so guest visitors can explore.
- Recruiters (Company role) can **Post New Listings** via a full-page modal with: title, company, location, stipend, deadline, description, skill tags, and category.
- Recruiters can **delete their own listings** with a confirmation step.
- Listings are filtered by **category** (Engineering, Design, Product, Marketing) and **search keyword**.
- Each listing card has a **"One-Click Apply"** shortcut for students who have a resume and profile already configured.

### 📝 Application System
- Students apply with a **cover letter** and their uploaded resume PDF.
- Applications are persisted in MongoDB and immediately visible in both the Student Tracker (applied jobs) and Company Tracker (candidate pipeline).
- On successful submission, an **automated receipt message** is dispatched from the company's "Talent Team" directly into the student's inbox.

### 📊 Application Tracker
**Student view:**
- Lists all submitted applications with live status badges: `Applied`, `Shortlisted`, `Interview`, `Offer`, `Rejected`.
- Shows company, role title, date applied, and cover letter preview.
- Displays offer details if a company has uploaded them.

**Company view (Candidate Tracker):**
- Full candidate profiles including: bio, technical skills tags, college, graduation year, GitHub, LinkedIn, Twitter (X) links.
- Recruiters can change application status via a dropdown — this **automatically sends a status-update inbox message** to the candidate.
- **View Resume** opens the candidate's PDF in a new browser tab (inline preview, not download).

### 💬 Messaging System
- Unified **threaded inbox** — all messages between a student and a company about the same internship listing are grouped into a single conversation thread.
- **Chat bubble UI** — outgoing messages align right (dark teal), incoming align left (light cream), automated system logs appear centered.
- **Reply in-thread** — the reply box pre-fills the recipient and internship context automatically.
- **Compose New Message** modal with optional internship listing selector for context linking.
- **Auto-scroll to latest** — the message log always snaps to the most recent bubble when a thread is opened or a new message arrives.
- **Real-time sync** — a 3-second polling interval keeps all message threads, statuses, and listings up to date without requiring a manual refresh.
- Unread messages are indicated with an animated dot in the sidebar badge and thread list.

### 👤 Profile Management
- Students can fill in: **Bio, College, Graduation Year, Portfolio URL, GitHub, LinkedIn, X (Twitter)**.
- **Skill Tags** — add via text input (suggestions shown), remove with one click.
- **Resume PDF upload** — drag-and-drop or file picker directly in the profile view.
- All profile data is persisted to MongoDB via `PUT /api/users/:id`.

### 🛡️ Admin Panel
- View platform-wide **activity logs** (listing published, application submitted, status changed, message sent).
- **Invite Users** — create student or recruiter accounts directly.
- **Manage Users** — change roles (e.g. Student → Company + assign company name), delete accounts.
- Platform stats overview: total users, listings, applications, messages.

### 🔔 Toast Notifications
- Non-blocking slide-in toasts (success / info / error) auto-dismiss after 4.5 seconds.
- Displayed for all major actions: login, apply, message sent, status updated, profile saved, etc.

---

## 📄 PDF Resume Storage — How It Works

### The Full Pipeline

```
Student (Browser)
    │
    │  multipart/form-data (PDF file, field name: "resume")
    ▼
POST /api/upload   ──────────────────────────────────────────────────┐
    │                                                                 │
    │  multer middleware (backend/config/multer.ts)                   │
    │  ┌─────────────────────────────────────────────────────────┐   │
    │  │ 1. Validates MIME type === "application/pdf"            │   │
    │  │ 2. Enforces 5 MB file size limit                        │   │
    │  │ 3. Generates unique filename:                           │   │
    │  │    resume-<timestamp>-<random9digits>.pdf               │   │
    │  │ 4. Writes file to: backend/uploads/                     │   │
    │  └─────────────────────────────────────────────────────────┘   │
    │                                                                 │
    │  uploadResumePdf controller (applicationController.ts)          │
    │  Returns: { success: true, filename, url: "/uploads/<file>" }   │
    │                                                                 │
    ▼                                                                 │
Frontend receives { url }                                             │
    │                                                                 │
    ├─► PUT /api/users/:id  ── saves resumeUrl + resumeName to User   │
    │                          document in MongoDB                    │
    │                                                                 │
    └─► When student applies:                                         │
        Application document stores resumeUrl + resumeName            │
                                                                      │
Static serving (server.ts):                                           │
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))  │
    │                                                                 │
    └─► GET http://localhost:5000/uploads/<filename>.pdf  ────────────┘
        (Recruiter clicks "View Resume" → opens PDF in new browser tab)
```

### Key Files Involved

| File | Role |
|---|---|
| `backend/config/multer.ts` | Configures Multer: disk storage destination, unique filename generator, PDF MIME filter, 5 MB limit |
| `backend/routes/index.ts` | Registers `POST /api/upload` with `upload.single('resume')` middleware |
| `backend/routes/applicationRoutes.ts` | Also registers `POST /api/applications/upload` as an alternate upload endpoint |
| `backend/controllers/applicationController.ts` | `uploadResumePdf` handler — reads `req.file`, constructs `/uploads/<filename>` public URL and returns it |
| `backend/server.ts` | `app.use('/uploads', express.static(...))` — serves files from `backend/uploads/` as static assets |
| `backend/uploads/` | **Physical storage directory** — all PDF files land here on disk |
| `frontend/src/components/ProfileView.tsx` | Upload UI (drag-and-drop + file picker), calls `POST /api/upload`, then `PUT /api/users/:id` |
| `frontend/src/components/TrackerView.tsx` | "View Resume" button: `window.open(resumeUrl, '_blank')` — opens the PDF inline in a new tab |

### Security & Validation
- Only `application/pdf` MIME type or `.pdf` extension is accepted — any other file type is rejected at the middleware level with an error.
- Files are capped at **5 MB** (`limits.fileSize`).
- Filenames are sanitized — the original name is discarded; a collision-safe name (`resume-<Date.now()>-<random>.pdf`) is generated.

---

## 🔄 Application Code Flow

### Startup Sequence

```
npm run dev  (root package.json → concurrently)
    ├── npm run dev --prefix frontend   →  Vite dev server → http://localhost:3000
    └── npm run dev --prefix backend    →  ts-node / nodemon
            │
            ├── dotenv.config()         (loads backend/.env)
            ├── connectDB()             (mongoose.connect to MongoDB)
            ├── clearHardcodedCollections()  (wipes Internship + ActivityLog on fresh boot)
            └── app.listen(5000)
```

### Frontend Boot (`frontend/src/main.tsx` → `App.tsx`)

```
main.tsx
  └── ReactDOM.render(<App />)

App.tsx — useEffect on mount:
  1. GET /api/internships              (public, no auth — populate listings)
  2. Read localStorage.getItem('token')
     ├── If token exists:
     │     GET /api/auth/me            (validate JWT, get user object)
     │     └── fetchPrivateData()      (parallel: users, applications, messages, activity-logs)
     └── If no token: show LandingView / AuthView
```

### Authentication Flow

```
AuthView.tsx  (Register or Login form)
    │
    │  POST /api/auth/register  or  POST /api/auth/login
    ▼
authController.ts
    ├── register: bcrypt.hash(password, 10) → save User → jwt.sign({ id }, JWT_SECRET, '7d')
    └── login:    bcrypt.compare(password, hash) → jwt.sign({ id }, JWT_SECRET, '7d')
    │
    └── returns { token, user }

App.tsx → handleAuthSuccess(token, user):
    ├── localStorage.setItem('token', token)
    ├── setCurrentUser(user)
    ├── setCurrentRole(user.role)
    ├── fetchPrivateData()
    └── navigate to Dashboard
```

### Real-Time Sync (Polling)

```
App.tsx — useEffect([currentUser]):
    └── setInterval(fetchPrivateData, 3000)
            │
            └── fetchPrivateData():
                  Promise.all([
                    GET /api/users,
                    GET /api/applications,
                    GET /api/messages,
                    GET /api/activity-logs
                  ])
                  → updates React state → re-renders views
```

### Applying to an Internship

```
Student clicks "Apply" on ListingsView.tsx
    │
    ├── POST /api/applications   { studentId, internshipId, coverLetter, resumeUrl, ... }
    │     └── ApplicationModel.save()  →  MongoDB
    │
    ├── POST /api/activity-logs  { text: "student applied for...", category: "new_application" }
    │
    └── POST /api/messages       { automated receipt from "Company Talent Team" → student inbox }
              internshipId + internshipTitle stored with message for thread grouping
```

### Status Update (Recruiter Flow)

```
Recruiter changes status dropdown in TrackerView.tsx
    │
    ├── PUT /api/applications/:id   { status: "Shortlisted" | "Interview" | "Offer" | "Rejected" }
    │     └── ApplicationModel.findOneAndUpdate()
    │
    ├── POST /api/activity-logs   { text: "recruiter shifted status of student to X", category: "status_change" }
    │
    └── POST /api/messages        { automated status update message → student inbox }
              subject: "Status Update: <internshipTitle>"
              content: personalised based on new status (Offer = congratulations, else = monitor dashboard)
```

### Messaging Thread Architecture

```
All messages stored in MongoDB with:
  { senderId, senderRole, receiverId, internshipId, internshipTitle, subject, content, ... }

MessagesView.tsx — thread grouping logic:
    filteredMessages (involving currentUser)
        │
        └── grouped by key = studentId + "_" + listingTitle
              (getListingTitle strips "Re:", "Status Update:", "Receipt: Application for" prefixes)
        │
        └── each group → Thread { studentId, recruiterId, messages[], latestMessage, unread }
        │
        └── sorted by latestMessage.createdAt DESC (newest thread first)

Active thread:
    threads.find(t => t.id === selectedThreadId) || threads[0]

Auto-scroll:
    useRef<HTMLDivElement> attached to message body div
    useEffect([activeThread.id, activeThread.messages.length]):
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
```

### Request Auth Guard

```
Every fetchWithAuth() call (App.tsx):
    └── reads localStorage.getItem('token')
        └── adds header: Authorization: Bearer <token>

Backend authMiddleware (backend/middleware/auth.ts):
    └── jwt.verify(token, JWT_SECRET)
        ├── Decodes { id }
        ├── UserProfileModel.findOne({ id }) — confirms user still exists
        └── attaches req.user → passes to next()

companyMiddleware:
    └── req.user.role === 'Company' || 'Admin'  →  allowed to POST/DELETE internships, update applications

adminMiddleware:
    └── req.user.role === 'Admin'  →  allowed to manage users
```

---

## 🗂️ Project Structure

```
internship-management-platform/
├── package.json                   # Root: concurrently scripts
├── .env.example                   # Template for environment variables
│
├── backend/
│   ├── server.ts                  # Express app entry, static /uploads serving, DB connect
│   ├── .env                       # PORT, MONGO_URI, JWT_SECRET
│   ├── config/
│   │   ├── db.ts                  # mongoose.connect()
│   │   └── multer.ts              # Multer disk storage config (PDF filter, 5MB limit)
│   ├── middleware/
│   │   └── auth.ts                # authMiddleware, adminMiddleware, companyMiddleware
│   ├── models/
│   │   ├── User.ts                # UserProfile schema (id, name, email, role, skills, resumeUrl, social links...)
│   │   ├── Internship.ts          # Internship schema (title, company, skills, category, deadline...)
│   │   ├── Application.ts         # Application schema (studentId, internshipId, status, resumeUrl...)
│   │   ├── Message.ts             # Message schema (senderId, receiverId, internshipId, internshipTitle...)
│   │   └── ActivityLog.ts         # ActivityLog schema (text, time, role, category)
│   ├── controllers/
│   │   ├── authController.ts      # register, login, getMe
│   │   ├── userController.ts      # getUsers, updateUser, updateUserRole, createUser, deleteUser
│   │   ├── internshipController.ts# getInternships, createInternship, deleteInternship
│   │   ├── applicationController.ts# getApplications, createApplication, updateApplication, uploadResumePdf
│   │   ├── messageController.ts   # getMessages, createMessage, markMessageRead
│   │   └── activityController.ts  # getActivityLogs, createActivityLog
│   ├── routes/
│   │   ├── index.ts               # Master router + POST /upload (resume)
│   │   ├── authRoutes.ts          # /register, /login, /me
│   │   ├── userRoutes.ts          # CRUD on /users
│   │   ├── internshipRoutes.ts    # GET, POST, DELETE /internships
│   │   ├── applicationRoutes.ts   # GET, POST, PUT /applications + /upload
│   │   ├── messageRoutes.ts       # GET, POST /messages + PUT /:id/read
│   │   └── activityRoutes.ts      # GET, POST /activity-logs
│   └── uploads/                   # 📁 PDF resume files stored here on disk
│
└── frontend/
    ├── vite.config.ts
    └── src/
        ├── main.tsx               # ReactDOM.render entry
        ├── types.ts               # TypeScript interfaces: UserProfile, Internship, Application, Message, ActivityLog, ToastMessage
        ├── index.css              # Global styles + Tailwind + custom font imports
        ├── App.tsx                # Root component: all state, all API handlers, routing logic, polling
        └── components/
            ├── LandingView.tsx    # Guest landing page (browse listings, sign-in CTA)
            ├── AuthView.tsx       # Login + Register forms
            ├── Sidebar.tsx        # Role-aware navigation sidebar (collapsible)
            ├── TopBar.tsx         # Top header (user avatar, unread badge, logout)
            ├── DashboardView.tsx  # Home dashboard: stats, recent activity, quick links
            ├── ListingsView.tsx   # Browse listings, post new listing (Company), apply (Student)
            ├── TrackerView.tsx    # Student: application pipeline │ Company: candidate tracker with resume viewer
            ├── MessagesView.tsx   # Threaded inbox, chat bubble UI, compose modal, auto-scroll
            ├── ProfileView.tsx    # Bio, skills, social links, PDF resume upload
            ├── AdminView.tsx      # User management, platform stats, activity logs
            └── Toast.tsx          # Slide-in toast notification component
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Create account |
| `POST` | `/api/auth/login` | None | Login, receive JWT |
| `GET` | `/api/auth/me` | Bearer Token | Validate session + get profile |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users` | Bearer Token | Get all users |
| `POST` | `/api/users` | Admin | Create user |
| `PUT` | `/api/users/:id` | Bearer Token | Update profile |
| `PUT` | `/api/users/:id/role` | Admin | Change role |
| `DELETE` | `/api/users/:id` | Admin | Delete user |

### Internships
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/internships` | None | List all internships |
| `POST` | `/api/internships` | Company / Admin | Post new listing |
| `DELETE` | `/api/internships/:id` | Company / Admin | Delete listing |

### Applications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/applications` | Bearer Token | Get all applications |
| `POST` | `/api/applications` | Bearer Token | Submit application |
| `PUT` | `/api/applications/:id` | Company / Admin | Update status + offer details |
| `POST` | `/api/applications/upload` | Bearer Token | Upload resume PDF |

### Messages
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/messages` | Bearer Token | Get all messages |
| `POST` | `/api/messages` | Bearer Token | Send message |
| `PUT` | `/api/messages/:id/read` | Bearer Token | Mark message as read |

### File Upload
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | Bearer Token | Upload resume PDF (multipart/form-data, field: `resume`) |
| `GET` | `/uploads/<filename>` | None | Serve stored PDF file statically |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- MongoDB running locally at `mongodb://127.0.0.1:27017/` **OR** a MongoDB Atlas connection string

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd internship-management-platform

# Install all dependencies (root + frontend + backend)
npm run install-all
```

### Configuration

Copy `.env.example` to `backend/.env` and fill in your values:

```bash
cp .env.example backend/.env
```

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/incipio
JWT_SECRET=your_super_secret_key_here
```

### Run Development Servers

```bash
# Starts both frontend (port 3000) and backend (port 5000) concurrently
npm run dev
```

Then open **http://localhost:3000** in your browser.

> **Note**: On first boot the server clears old internship listings and activity logs for a clean slate. Register a new account to get started!

---

## 🔑 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Express server port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/incipio` | MongoDB connection string |
| `JWT_SECRET` | `incipio_secret_key_107` | JWT signing secret (change in production!) |

---

## 📦 Key Dependencies

### Backend
| Package | Purpose |
|---|---|
| `express` | HTTP server and routing |
| `mongoose` | MongoDB ODM + schema validation |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT creation and verification |
| `multer` | Multipart form-data file upload handling |
| `cors` | Cross-origin resource sharing |
| `dotenv` | Environment variable loading |

### Frontend
| Package | Purpose |
|---|---|
| `react` / `react-dom` | UI rendering |
| `typescript` | Type safety |
| `vite` | Dev server + bundler |
| `tailwindcss` | Utility-first CSS framework |
| `lucide-react` | Icon library |

---

*Built with ❤️ — Incipio v2.0.0*
