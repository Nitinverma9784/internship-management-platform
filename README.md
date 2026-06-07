# 🎓 Placera — Premium Placement Management Platform

> A full-stack university placement management system. Placera features real-time data sync, role-based access control, file uploading using Cloudinary, a smart context-aware AI chatbot, and pre-application eligibility verification gates.

---

## 📋 Table of Contents

1. [Tech Stack](#-tech-stack)
2. [Role-Based Authentication (RBAC)](#-role-based-authentication-rbac)
3. [Protected Routes](#-protected-routes)
4. [Cloudinary File Upload Pipeline](#-cloudinary-file-upload-pipeline)
5. [Context-Aware AI Career Advisor Chatbot](#-context-aware-ai-career-advisor-chatbot)
6. [Apply Placement Flow & Vetting Gates](#-apply-placement-flow--vetting-gates)
7. [API Endpoint Directory](#-api-endpoint-directory)
8. [Getting Started & Configuration](#-getting-started--configuration)
9. [🎙️ 1-Minute Technical Explanation Scripts](#%EF%B8%8F-1-minute-technical-explanation-scripts)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Interactive single-page application |
| **Bundler** | Vite 6 | Fast development server and builds |
| **Styling** | Tailwind CSS v4 | Dark and light HSL theme colors |
| **Backend** | Node.js + Express | REST API and request routing |
| **Database** | MongoDB via Mongoose | Data models and storage |
| **Authentication** | JWT (JSON Web Tokens) | Secure user login sessions |
| **Cloud Storage** | **Cloudinary API** | Off-site storage for user avatars and PDF resumes |
| **AI Integration** | **Groq SDK** | Llama-3.3 model for bio enhancement and matching |
| **File Handling** | Multer | Server-side upload validation |

---

## 🔐 Role-Based Authentication (RBAC)

Placera separates users into four different roles: `Student`, `Company` (Recruiter), `Faculty`, and `Admin`. 

### How User Signup & Login Works
1. **Password Hashing**: When registering, passwords are encrypted using `bcryptjs` (10 salt rounds) before saving to MongoDB.
2. **Session Token**: When logging in, the server generates a JSON Web Token (JWT) signed with `JWT_SECRET`. This token is valid for 7 days.
3. **Frontend Storage**: The client stores this token in `localStorage` and adds it to the HTTP headers as `Authorization: Bearer <token>` for all private requests.

### Backend Middlewares
To secure API endpoints, the backend uses Express middlewares to verify roles before responding:
* `authMiddleware`: Reads the JWT, finds the user in MongoDB, and attaches them to `req.user`.
* `studentMiddleware`: Allows only `Student` and `Admin` access.
* `companyMiddleware`: Allows only `Company` and `Admin` access.
* `facultyMiddleware`: Allows only `Faculty` and `Admin` access.
* `adminMiddleware`: Allows only `Admin` access.

---

## 🛡️ Protected Routes

In the frontend, we use React Router DOM and a wrapper component called `RoleGuard` to protect pages.

### How RoleGuard Works
The `RoleGuard` component intercepts page changes by checking the logged-in user:
1. **Not Logged In**: Redirects the user to the `/login` page.
2. **Wrong Role**: If a logged-in user tries to open a page that is not allowed for their role (for example, a `Student` accessing `/admin/panel`), they are shown the `<AccessDenied>` component.
3. **Authorized**: Renders the child page elements normally.

### Code Setup Example
In [App.tsx](file:///d:/internship-management-platform/frontend/src/App.tsx), routes are wrapped like this:

```tsx
<Route path="/student/dashboard" element={
  <RoleGuard currentUser={currentUser} allowedRoles={['Student']}>
    <DashboardView />
  </RoleGuard>
} />
```

---

## ☁️ Cloudinary File Upload Pipeline

To keep the server clean, files are stored off-site using Cloudinary.

```
[User Form] ──► [Express (Multer)] ──► [Cloudinary Cloud] ──► [MongoDB]
                   │                      │
                   ├──► Validate Size     └──► Crop & Transform Avatar
                   └──► Save Temp File         (Delete temp file after)
```

### Step-by-Step Upload Flow
1. **Form Submission**: The user uploads an avatar (image) or resume (PDF) as `multipart/form-data`.
2. **Multer Checks**: The backend checks the file. Avatars must be images under 2MB. Resumes must be PDFs under 5MB. Valid files are written to a temporary local `/uploads` directory.
3. **Cloudinary Stream**:
   - **Avatars**: Cloudinary automatically crops the image to a $250 \times 250$ square centered on the user's face.
   - **Resumes**: Uploaded to a secure folder, formatted to allow inline PDF previews directly in the browser.
4. **Cleanup**: The server deletes the temporary local file using `fs.unlinkSync()` and saves the Cloudinary URL to the user's MongoDB record.

---

## 🤖 Context-Aware AI Career Advisor Chatbot

The student dashboard features a chatbot that acts as an academic counselor. It is "context-aware" because it knows the student's exact academic profile.

### How the Context is Passed
When a student sends a message, the server fetches their profile from MongoDB and inserts it into the AI prompt instructions:

```typescript
const formattedMessages = [
  {
    role: 'system',
    content: `You are an AI Career Advisor at SPSU.
    
    STUDENT BACKGROUND:
    Name: ${student.name}
    Bio: ${student.bio || 'None'}
    Skills: ${JSON.stringify(student.skills || [])}
    GPA history: ${JSON.stringify(student.grades || [])}
    Certifications: ${JSON.stringify(student.certificates || [])}`
  },
  ...history,
  { role: 'user', content: message }
];
```

### Chatbot Features
* **Custom Advice**: The bot gives answers tailored to the student's actual grades and skills.
* **Skill Recommendations**: Recommends technical topics the student should learn next to fill profile gaps.
* **Offline Fallback**: If the Groq API key is missing, a local scanner reads user text for keywords like `cv`, `grades`, or `interview` and replies with instructions listing the student's actual skills.

---

## 📝 Apply Placement Flow & Vetting Gates

Students must pass three separate security and quality checks before they can apply for a job placement.

### Vetting Gate 1: Resume Verification
Students cannot use "One-Click Apply" unless they have successfully uploaded a resume PDF to Cloudinary.

### Vetting Gate 2: Faculty Approval Gate
* Students must be manually approved as `Verified` by a faculty member in the dashboard.
* **Auto-Reset on Edit**: If a student edits their biography or skills on the Profile page, their status automatically resets to `Pending`. This blocks them from applying until faculty reviews the updates.

### Vetting Gate 3: AI SmartMatch Eligibility Gateway
* Before applying, the student must click **Check Eligibility** on the listing.
* The backend audits the student's profile against the listing requirements and outputs a score from 0% to 100%.
* If the score is **below 60%**, the apply buttons are locked, and the student is shown the specific gaps they need to fix.
* **Matching Algorithm Formula**:
  $$\text{Match Score} = \text{Skills (70% max)} + \text{Bio keywords (20% max)} + \text{GPA (10% max)}$$

### Successful Submission
Once the student passes all gates and submits the application, the database is updated, and the system sends an automatic receipt email/message from the recruiter's team to the student's chat inbox.

---

## 🌐 API Endpoint Directory

### Authentication `/api/auth`
* `POST /register`: Create a student, company, faculty, or admin account.
* `POST /login`: Logs in user and returns JWT.
* `GET /me`: Returns details of current logged-in user.

### Users `/api/users`
* `GET /`: Lists all users.
* `PUT /:id`: Updates user profile data.
* `POST /upload-avatar`: Uploads avatar image to Cloudinary.
* `POST /enhance-bio`: AI rewrites bio description.
* `POST /audit-match`: Audits student compatibility with listing.
* `POST /chat`: Chats with context-aware AI advisor.

### Placements `/api/internships`
* `GET /`: Lists all active placement opportunities.
* `POST /`: Recruiter publishes a new placement listing.
* `PUT /:id`: Faculty approves or rejects a placement listing.
* `DELETE /:id`: Recruiter deletes a placement listing.

---

## 🚀 Getting Started & Configuration

### Root Environment File (`backend/.env`)
Create a `.env` file inside the `backend` folder with these variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# AI Setup
GROQ_API_KEY=your_groq_api_key
```

### Installation
```bash
# Install node packages for both frontend and backend
npm run install-all

# Start both development servers concurrently
npm run dev
```

---

## 🎙️ 1-Minute Technical Explanation Scripts

Use these easy-to-read scripts to explain the platform functions in presentations or interviews.

---

### Topic 1: Role-Based Authentication (RBAC)

**Duration**: ~60 seconds | **Words**: ~140

> "Placera uses role-based authentication to manage access levels for Students, Companies, Faculty, and Admins. When a user registers, their password is encrypted using `bcryptjs` with 10 salt rounds before saving. When logging in, the server generates a JSON Web Token, or JWT, containing the user's ID. This token is valid for 7 days.
> 
> The client saves this token in `localStorage` and sends it in the authorization headers for future requests. On the backend, we use Express middlewares. The `authMiddleware` decodes the token and gets the user profile. Then, other middlewares like `studentMiddleware` or `facultyMiddleware` check if the user has the required role. If they do not, the server blocks the request and returns a `403 Forbidden` response."

---

### Topic 2: Protected Routes

**Duration**: ~60 seconds | **Words**: ~130

> "On the frontend, we use React Router DOM alongside a guard component called `RoleGuard` to protect pages. The guard wraps each view route and specifies which user roles are allowed to access it. 
> 
> When a user tries to load a page, the guard checks their session state. If they are not logged in, it redirects them to the `/login` page. If they are logged in but do not have the correct role—for example, if a student attempts to access `/admin/panel`—the guard blocks the page render. Instead of displaying the private component, it loads a custom `<AccessDenied>` component. This prevents unauthorized users from viewing admin or recruiter sections."

---

### Topic 3: Cloudinary File Upload Pipeline

**Duration**: ~60 seconds | **Words**: ~140

> "Placera uploads profile pictures and resumes off-site using Cloudinary to keep the backend server fast. The upload request uses `multipart/form-data` and is captured by Multer middleware. Multer checks that images are under 2MB and resumes are PDFs under 5MB.
> 
> Next, the controller uploads the file to the Cloudinary cloud database. For avatars, we apply a crop transformation centered on the user's face to create a 250x250 square. Resumes are uploaded to a dedicated PDF folder to allow inline web browser previews. As soon as the upload finishes, the server runs `fs.unlinkSync` to delete the temporary file from the local disk. The secure Cloudinary URL is then saved in MongoDB."

---

### Topic 4: Context-Aware AI Career Advisor Chatbot

**Duration**: ~60 seconds | **Words**: ~140

> "The AI Career Advisor is context-aware because it knows the student's academic profile. When a student sends a message, the server retrieves their profile from MongoDB, including their name, bio, skills, semester GPA records, and certifications.
> 
> The server packages this background information and sends it to the Groq API using the `llama-3.3-70b-versatile` model. Because the AI has this context, it can give personalized advice—like pointing out missing skills or suggesting interview prep tips. If the API is offline, a local keyword filter checks the user's text for terms like `grades` or `cv` and returns pre-written replies customized with the student's actual skills list."

---

### Topic 5: Internship Application & Pre-Application Vetting

**Duration**: ~60 seconds | **Words**: ~145

> "Students must pass three vetting checks before they can apply for a placement. First, they must have uploaded a PDF resume to Cloudinary. Second, their profile must be manually approved as `Verified` by a faculty member. If the student edits their profile afterward, the system resets their verification status to `Pending` and blocks further applications until a faculty coordinator reviews the changes.
> 
> Third, the student must run the SPSU SmartMatch eligibility audit. The system matches the student's skills, GPA, and bio against the job description to calculate a suitability score. If this score is below 60%, the apply buttons are disabled. Once all gates are passed, the application is saved, and the system sends an automatic receipt message from the recruiter to the student's inbox."

---

*Built with ❤️ — Placera Premium Platform*
