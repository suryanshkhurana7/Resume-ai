# 🎯 AI Interview Prep

An AI-powered full-stack interview preparation platform that analyzes your resume against a job description and generates personalized interview reports — complete with match scores, curated questions, skill gap analysis, preparation plans, and tailored ATS-friendly resumes.

---

## ✨ Features

- **📄 Resume Analysis** — Upload your resume (PDF) and get it parsed and analyzed against any job description.
- **📊 Match Score** — Get a 0–100 compatibility score between your profile and the target role.
- **❓ Interview Questions** — Receive curated technical and behavioral questions with interviewer intent and model answers.
- **🔍 Skill Gap Analysis** — Identify missing skills with severity ratings (low / medium / high).
- **📅 Preparation Plan** — Get a day-wise study plan tailored to bridge your skill gaps before the interview.
- **📝 AI Resume Builder** — Generate a job-tailored, ATS-friendly resume and download it as a PDF.
- **🔐 Authentication** — Secure JWT-based auth with cookie sessions and token blacklisting.
- **📁 Report History** — View and revisit all previously generated interview reports.

---

## 🛠️ Tech Stack

| Layer        | Technologies                                                      |
| ------------ | ----------------------------------------------------------------- |
| **Frontend** | React 19, Vite, React Router, SCSS, Axios                        |
| **Backend**  | Node.js, Express 5, Mongoose, JWT, bcrypt, Multer, cookie-parser |
| **AI**       | Google Gemini API (`gemini-3.6-flash`), Zod schema validation     |
| **PDF**      | pdf-parse (extraction), Puppeteer (generation)                    |
| **Database** | MongoDB                                                           |

---

## 📐 Architecture

```
┌──────────────────┐        ┌──────────────────────┐       ┌─────────────────┐
│                  │  REST  │                      │       │                 │
│   React (Vite)   │◄──────►│   Express API        │◄─────►│    MongoDB      │
│                  │        │                      │       │                 │
└──────────────────┘        └──────────┬───────────┘       └─────────────────┘
                                       │
                            ┌──────────▼───────────┐
                            │   Google Gemini API   │
                            │  (Structured Output)  │
                            └──────────────────────┘
```

The backend follows **MVC architecture**:

```
Routes → Controllers → Services → Models
```

- **Routes** define API endpoints and wire up middleware (auth, file upload).
- **Controllers** handle request/response logic and orchestrate service calls.
- **Services** contain core business logic (AI generation, PDF conversion).
- **Models** define MongoDB schemas with Mongoose.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/suryanshkhurana7/Resume-ai.git
cd Resume-ai
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
GOOGLE_GENAI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://localhost:27017/fsgai
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm run dev
```

The server runs on `http://localhost:3000`.

### 3. Setup Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint             | Description                  | Access  |
| ------ | -------------------- | ---------------------------- | ------- |
| POST   | `/api/auth/register` | Register a new user          | Public  |
| POST   | `/api/auth/login`    | Login with email & password  | Public  |
| GET    | `/api/auth/logout`   | Logout & blacklist token     | Public  |
| GET    | `/api/auth/get-me`   | Get current user details     | Private |

### Interview Reports

| Method | Endpoint                                      | Description                                | Access  |
| ------ | --------------------------------------------- | ------------------------------------------ | ------- |
| POST   | `/api/interview/`                             | Generate interview report (multipart form) | Private |
| GET    | `/api/interview/`                             | Get all reports for logged-in user         | Private |
| GET    | `/api/interview/report/:interviewId`          | Get a specific report by ID                | Private |
| POST   | `/api/interview/resume/pdf/:interviewReportId`| Generate & download tailored resume PDF    | Private |

### Generate Interview Report — Request Body

```
Content-Type: multipart/form-data

Fields:
  resume           (file)    — PDF resume file
  selfDescription  (string)  — Candidate's self-description
  jobDescription   (string)  — Target job description
```

### Interview Report — Response Schema

```json
{
  "matchScore": 78,
  "title": "Senior Frontend Developer",
  "technicalQuestions": [
    {
      "question": "Explain React's reconciliation algorithm",
      "intention": "Assess deep understanding of React internals",
      "answer": "Discuss the virtual DOM diffing process..."
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Describe a time you resolved a team conflict",
      "intention": "Evaluate conflict resolution and communication skills",
      "answer": "Use the STAR method to structure your response..."
    }
  ],
  "skillGaps": [
    { "skill": "TypeScript", "severity": "medium" },
    { "skill": "System Design", "severity": "high" }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "TypeScript Fundamentals",
      "tasks": [
        "Complete TypeScript handbook sections 1-3",
        "Convert a small JS project to TypeScript"
      ]
    }
  ]
}
```

---

## 📂 Project Structure

```
fsgai/
├── Backend/
│   ├── server.js                          # Entry point — connects DB & starts server
│   ├── package.json
│   └── src/
│       ├── app.js                         # Express app setup, middleware, routes
│       ├── config/
│       │   └── database.js                # MongoDB connection config
│       ├── controllers/
│       │   ├── auth.controller.js         # Register, login, logout, get-me
│       │   └── interview.controller.js    # Generate report, get reports, resume PDF
│       ├── middlewares/
│       │   ├── auth.middleware.js          # JWT verification middleware
│       │   └── file.middleware.js          # Multer file upload config
│       ├── models/
│       │   ├── user.model.js              # User schema (username, email, password)
│       │   ├── blacklist.model.js         # Token blacklist for logout
│       │   └── interviewReport.model.js   # Interview report schema
│       ├── routes/
│       │   ├── auth.routes.js             # Auth API routes
│       │   └── interview.routes.js        # Interview API routes
│       └── services/
│           └── ai.service.js              # Gemini AI integration & PDF generation
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx                       # React entry point
        ├── App.jsx                        # App shell with router
        ├── app.routes.jsx                 # Route definitions
        ├── style.scss                     # Global styles
        ├── styles/                        # SCSS modules
        ├── components/
        │   └── Loading/                   # Loading spinner component
        └── features/
            ├── auth/
            │   ├── auth.context.jsx       # Auth context provider
            │   ├── auth.form.scss         # Auth form styles
            │   ├── components/            # Protected route wrapper
            │   ├── hooks/                 # Auth custom hooks
            │   ├── pages/                 # Login & Register pages
            │   └── services/              # Auth API calls
            └── interview/
                ├── interview.context.jsx  # Interview context provider
                ├── hooks/                 # Interview custom hooks
                ├── pages/
                │   ├── Home.jsx           # Dashboard — create & list reports
                │   └── Interview.jsx      # Interview report detail view
                ├── services/
                │   └── interview.api.js   # Interview API calls
                └── styles/                # Interview feature styles
```

---

## 🔒 How Authentication Works

1. On **register/login**, the server creates a JWT token (expires in 24h) and sets it as an HTTP cookie.
2. The `authMiddleware` verifies the token on every protected route and attaches `req.user`.
3. On **logout**, the token is added to a MongoDB blacklist collection and the cookie is cleared.
4. The frontend sends `withCredentials: true` on every Axios request to include cookies automatically.

---

## 🤖 How AI Generation Works

1. The user uploads a **resume PDF** along with a **self-description** and a **job description**.
2. The backend extracts text from the PDF using `pdf-parse`.
3. The extracted text + inputs are sent to the **Google Gemini API** with a structured JSON response schema.
4. The AI response is validated against a **Zod schema** to ensure type safety before being saved to MongoDB.
5. For resume generation, Gemini outputs HTML which is rendered to a PDF using **Puppeteer**.

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
