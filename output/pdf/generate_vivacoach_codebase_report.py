from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    Preformatted,
    KeepTogether,
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from xml.sax.saxutils import escape


OUTPUT = "output/pdf/VivaCoach_AI_Codebase_Documentation_Report.pdf"


def safe(text):
    return escape(str(text)).replace("\n", "<br/>")


styles = getSampleStyleSheet()

TITLE = ParagraphStyle(
    "TitleCustom",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=26,
    leading=31,
    alignment=TA_CENTER,
    textColor=colors.HexColor("#0f172a"),
    spaceAfter=12,
)

SUBTITLE = ParagraphStyle(
    "SubtitleCustom",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=11,
    leading=16,
    alignment=TA_CENTER,
    textColor=colors.HexColor("#475569"),
)

H1 = ParagraphStyle(
    "H1Custom",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=18,
    leading=22,
    textColor=colors.HexColor("#0f172a"),
    spaceBefore=14,
    spaceAfter=8,
)

H2 = ParagraphStyle(
    "H2Custom",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=13,
    leading=16,
    textColor=colors.HexColor("#1e40af"),
    spaceBefore=10,
    spaceAfter=5,
)

BODY = ParagraphStyle(
    "BodyCustom",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9.2,
    leading=13,
    textColor=colors.HexColor("#1f2937"),
    spaceAfter=5,
)

SMALL = ParagraphStyle(
    "SmallCustom",
    parent=BODY,
    fontSize=8,
    leading=10.5,
    textColor=colors.HexColor("#334155"),
)

CELL = ParagraphStyle(
    "CellCustom",
    parent=BODY,
    fontSize=7.2,
    leading=9,
    spaceAfter=0,
)

HEADER_CELL = ParagraphStyle(
    "HeaderCell",
    parent=CELL,
    fontName="Helvetica-Bold",
    textColor=colors.white,
)

CODE = ParagraphStyle(
    "CodeCustom",
    parent=styles["Code"],
    fontName="Courier",
    fontSize=7.8,
    leading=9.5,
    textColor=colors.HexColor("#0f172a"),
    backColor=colors.HexColor("#f8fafc"),
    borderColor=colors.HexColor("#cbd5e1"),
    borderWidth=0.35,
    borderPadding=6,
    spaceBefore=4,
    spaceAfter=7,
)


def p(text, style=BODY):
    return Paragraph(safe(text), style)


def h1(text):
    return Paragraph(safe(text), H1)


def h2(text):
    return Paragraph(safe(text), H2)


def bullet(items):
    flow = []
    for item in items:
        flow.append(Paragraph("- " + safe(item), BODY))
    flow.append(Spacer(1, 4))
    return flow


def small_bullet(items):
    flow = []
    for item in items:
        flow.append(Paragraph("- " + safe(item), SMALL))
    flow.append(Spacer(1, 3))
    return flow


def code(text):
    return Preformatted(text, CODE)


def table(headers, rows, col_widths=None, font_size=7.2):
    data = [[Paragraph(safe(h), HEADER_CELL) for h in headers]]
    cell_style = ParagraphStyle("TableCellDynamic", parent=CELL, fontSize=font_size, leading=font_size + 1.8)
    for row in rows:
        data.append([Paragraph(safe(c), cell_style) for c in row])

    t = Table(data, colWidths=col_widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cbd5e1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def diagram(title, text):
    return KeepTogether([
        h2(title),
        code(text),
    ])


def on_page(canvas, doc):
    canvas.saveState()
    width, height = landscape(A4)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawString(doc.leftMargin, 0.28 * inch, "VivaCoach-AI / PrepAI codebase documentation")
    canvas.drawRightString(width - doc.rightMargin, 0.28 * inch, f"Page {doc.page}")
    canvas.restoreState()


story = []

story.append(Spacer(1, 1.1 * inch))
story.append(Paragraph("VivaCoach-AI / PrepAI", TITLE))
story.append(Paragraph("Complete Codebase Analysis and Developer Documentation Report", TITLE))
story.append(Paragraph("Prepared for final year project viva explanation", SUBTITLE))
story.append(Spacer(1, 0.25 * inch))
story.append(Paragraph("Generated from the actual repository files on 2026-06-23.", SUBTITLE))
story.append(Spacer(1, 0.15 * inch))
story.append(Paragraph("Workspace: C:/Users/toufe/OneDrive/Semester notes/Project", SUBTITLE))
story.append(PageBreak())

story.append(h1("1. PROJECT OVERVIEW"))
story.append(p("Purpose: VivaCoach-AI, shown in the frontend as PrepAI, is an AI-powered interview practice and communication coaching platform. It lets a user register/login, start a mock interview, answer questions by typing or using browser speech recognition, receive AI-based feedback, analyze facial expression signals from the camera, and review saved performance reports."))
story += bullet([
    "Main features: JWT authentication, protected dashboard, AI-generated interview questions, practice/live interview modes, text and voice input, per-answer scoring, adaptive follow-up questions, expression analysis from webcam frames, report dashboard, expression lab, and AI communication coach.",
    "Overall architecture: React SPA frontend in prepai communicates with a Node.js/Express REST API in backend. Express uses Mongoose models to store users, sessions, transcripts, questions, and interview sessions in MongoDB. External AI services provide LLM evaluation, question generation, grammar correction, speech transcription, and facial expression recognition.",
    "Frontend technologies: React 18, Vite 5, React Router DOM 6, Axios, Tailwind CSS, Recharts, browser MediaDevices API, Web Speech API SpeechRecognition, and SpeechSynthesis.",
    "Backend technologies: Node.js, Express, Mongoose, JWT, bcryptjs, multer memory uploads, axios, form-data, Groq SDK, Google Gemini SDK/API, uuid, cors, dotenv.",
    "Database: MongoDB through Mongoose. Main collections are users, sessions, transcripts, questions, and interviewsessions.",
    "External APIs/AI services: Groq llama-3.3-70b-versatile for interview questions, answer evaluation, follow-up generation, interview summaries, and coach chat; Google Gemini for grammar correction and the older question route; Hugging Face Gradio Space for facial expression recognition; optional AI_SERVICE_URL /transcribe for backend audio transcription.",
])

story.append(h2("Important Code Reality Checks"))
story += bullet([
    "The active interview question route is /api/interview/questions using Groq. The older /api/questions/generate route exists in backend/routes/questionGen.routes.js but is commented out in backend/server.js.",
    "The main interview microphone flow does not upload audio to the backend. It uses browser SpeechRecognition to turn speech into text inside the frontend.",
    "The backend speech upload route /api/speech/transcribe exists, but no current frontend file calls it.",
    "MediaPipe is not installed or imported in the current code. prepai/src/features/interview/bodyLanguage.js can read MediaPipe-like fields if a backend returns them, but backend/controllers/expression.controller/analyze.js currently returns only expression, confidence, and face_detected.",
    "In main interview mode, expression frames are posted to /api/expression/analyze with an InterviewSession sessionId, but the expression controller saves logs only to the Session model, so the interview expression data is kept in frontend state and then saved per answer through /api/interview/answer.",
])

story.append(h2("High Level Architecture"))
story.append(code("""React/Vite frontend (prepai)
  - Pages: Landing, Login, Register, Dashboard, Interview, Report, Coach, Session
  - Shared API client adds Bearer token
  - Browser camera and speech APIs capture local user signals

        HTTP JSON / multipart requests
                 |
                 v
Express backend (backend)
  - Auth, sessions, interview, coach, expression, speech routes
  - JWT middleware protects private APIs
  - Mongoose models persist users and session/report data
  - AI integrations call Groq, Gemini, Hugging Face Gradio, optional transcription service

                 |
                 v
MongoDB
  - User, Session, Transcript, Question, InterviewSession collections"""))

story.append(PageBreak())
story.append(h1("2. COMPLETE FOLDER STRUCTURE"))
story.append(p("This repository has two main application folders plus root-level documentation/configuration. node_modules and build outputs are dependencies/artifacts, not source code."))

folder_rows = [
    ("README.md", "Project overview, setup instructions, high-level architecture, environment variables, and common workflow."),
    (".gitignore", "Excludes node_modules, .env, generated exports, logs, dist/build outputs, and OS files."),
    ("repomix-output.xml", "Generated packed repository snapshot. It is listed in .gitignore and is not part of runtime logic."),
    ("backend/", "Node.js/Express API server, database models, middleware, route definitions, controllers, and scoring utilities."),
    ("backend/server.js", "Backend entry point. Loads env, connects MongoDB, creates Express app, configures CORS/body parsing, mounts routes, starts port 5001 by default."),
    ("backend/config/db.js", "Mongoose connection helper using process.env.MONGO_URI."),
    ("backend/routes/", "Express routers. Each file maps URL paths to controller functions and middleware."),
    ("backend/controllers/", "Business logic grouped by feature: auth, sessions, interview, coach, expression, speech, and older question generation."),
    ("backend/models/", "Mongoose schemas for User, Session, Transcript, Question, and InterviewSession."),
    ("backend/middleware/", "auth.middleware.js verifies JWTs; upload.middleware.js parses image/audio uploads in memory."),
    ("backend/utils/scoreCalculator.js", "Local scoring functions for filler words, WPM, grammar/filler/confidence/speech/multimodal/overall scores, feedback, and dominant emotion."),
    ("backend/package.json", "Backend dependencies and scripts: start, dev, ai, dev:all."),
    ("prepai/", "React/Vite frontend application."),
    ("prepai/index.html", "HTML shell with #root and /src/main.jsx script."),
    ("prepai/vite.config.js", "Vite React plugin and dev server port 5173."),
    ("prepai/tailwind.config.js", "Tailwind content paths for index.html and src files."),
    ("prepai/postcss.config.js", "Tailwind and Autoprefixer PostCSS plugins."),
    ("prepai/src/main.jsx", "React entry point. Renders <App /> inside StrictMode."),
    ("prepai/src/App.jsx", "Router setup, AuthProvider, ProtectedRoute, and route-to-page mapping."),
    ("prepai/src/api/index.js", "Axios API instance with base URL, JWT request interceptor, and 401 logout event handling."),
    ("prepai/src/context/AuthContext.jsx", "Global auth state, session restore, login/register/logout functions."),
    ("prepai/src/components/Layout.jsx", "Protected app shell with sidebar navigation and sign out."),
    ("prepai/src/pages/", "Top-level page routes: Landing, Login, Register, Dashboard, Session, Report, Coach."),
    ("prepai/src/features/", "Feature-level interview UI, analysis panel, body language helpers, camera/speech controller hooks."),
    ("prepai/src/coach/", "AI communication coach screens, state hook, camera hook, speech hook, helper functions."),
    ("prepai/src/index.css", "Tailwind imports, CSS variables, reusable UI classes, global dark theme."),
]
story.append(table(["Path", "Why it exists"], folder_rows, [2.4 * inch, 8.2 * inch], 7.8))

story.append(h2("Backend Important Files"))
backend_files = [
    ("routes/auth.routes.js", "POST /register, POST /login, GET /me."),
    ("controllers/auth.controller/handlers.js", "register, login, getMe. Creates users, validates passwords, returns JWT and user payload."),
    ("controllers/auth.controller/token.js", "generateToken signs JWT payload { id } using JWT_SECRET and JWT_EXPIRES_IN."),
    ("middleware/auth.middleware.js", "protect reads Bearer token, verifies JWT, loads req.user. adminOnly exists but is not used by current routes."),
    ("models/User.js", "User schema with name, email, hashed password, role, totalSessions. pre-save hook hashes password."),
    ("routes/interview.routes.js", "Protected interview routes: questions, start, answer, end, history, get by sessionId."),
    ("controllers/interview.controller/questionHandlers.js", "Generates 5 interview questions through Groq."),
    ("controllers/interview.controller/sessionHandlers.js", "Creates InterviewSession, ends interview, generates overall Groq summary, computes totalScore."),
    ("controllers/interview.controller/answerHandlers.js", "Core scoring path. Detects fillers, WPM, asks Groq for scores, generates follow-ups/adaptive questions, stores answer."),
    ("controllers/interview.controller/groqClient.js", "Groq client using model llama-3.3-70b-versatile and JSON parsing helper."),
    ("models/InterviewSession.js", "Embedded answers with question, answer, emotionSummary, scores, feedback, adaptiveQuestions, and session totals."),
    ("routes/expression.routes.js", "POST /api/expression/analyze with protect + multer image upload."),
    ("controllers/expression.controller/analyze.js", "Uploads image frame to Hugging Face Gradio Space, queues prediction, parses SSE response, optionally saves to Session."),
    ("controllers/expression.controller/hfConfig.js", "Gradio endpoints and label normalization."),
    ("routes/speech.routes.js", "Protected speech init, text correction, audio transcription, transcript lookup."),
    ("controllers/speech.controller/correct.js", "Uses Gemini 2.0 Flash REST endpoint to correct text, then saves Transcript."),
    ("controllers/speech.controller/transcribe.js", "Forwards uploaded audio to AI_SERVICE_URL/transcribe, then calls correctText."),
    ("routes/coach.routes.js", "Protected coach start/message/summary endpoints."),
    ("controllers/coach.controller/message.js", "Groq coach response plus structured feedback, local fallback when AI fails."),
    ("controllers/coach.controller/session.js", "Starts coach session and summarizes conversation with emotion/speech-derived stats."),
    ("models/Session.js", "Older expression lab session model with expressionLog, expressionSummary, duration, dominantExpression."),
    ("models/Transcript.js", "Speech correction transcript linked to User and Session."),
    ("models/Question.js", "Question bank fallback for older question generation route."),
]
story.append(table(["File", "Role"], backend_files, [3.1 * inch, 7.5 * inch], 7.3))

story.append(h2("Frontend Important Files"))
frontend_files = [
    ("src/App.jsx", "Defines public/protected routes and wraps all pages with AuthProvider."),
    ("src/api/index.js", "Central API client. Base URL is VITE_API_URL or http://localhost:5001/api."),
    ("src/context/AuthContext.jsx", "Restores logged-in user via /auth/me, calls /auth/login and /auth/register, stores token/user."),
    ("src/pages/Login.jsx", "Login form. Calls useAuth().login and navigates to dashboard or original protected route."),
    ("src/pages/Register.jsx", "Registration form. Calls useAuth().register and navigates to dashboard."),
    ("src/pages/dashboard/index.jsx", "Dashboard. Fetches /sessions/report, /sessions, and /interview/history."),
    ("src/features/interview/Interview.jsx", "Reads mode query string and connects useInterviewController to InterviewUI."),
    ("src/features/interview/controller/index.js", "Main interview state machine and public actions."),
    ("src/features/interview/controller/actions.js", "Start interview, submit answer, next question, insert follow-ups, end interview."),
    ("src/features/interview/controller/useInterviewMedia.js", "Camera stream, canvas frame capture, /expression/analyze posting, browser speech recognition."),
    ("src/features/interview/bodyLanguage.js", "Turns expression/body payload into UI body-language metrics and alerts."),
    ("src/features/interview/speech.js", "SpeechSynthesis for reading questions and SpeechRecognition for answers."),
    ("src/features/AnalysisPanel.jsx", "Video preview, hidden canvas, facial signal summary, body-language metrics, live alerts."),
    ("src/features/interview/ui/*.jsx", "SetupStep, QuestionStep, ResultStep, FinalStep, Header."),
    ("src/pages/report/index.jsx", "Fetches /interview/history and renders report sections."),
    ("src/pages/report/utils.js", "Builds report averages, comparisons, emotion totals, trends, and recommendations."),
    ("src/pages/session/useSessionAnalysis.js", "Expression lab camera/session flow using /sessions and /expression/analyze."),
    ("src/coach/useCoach/index.js", "Coach state machine and calls to /coach/start, /coach/message, /coach/summary."),
    ("src/coach/useCoach/useCoachCamera.js", "Coach camera capture every 2.5 seconds to /expression/analyze."),
    ("src/coach/useCoach/useCoachSpeech.js", "Coach SpeechRecognition and SpeechSynthesis."),
]
story.append(table(["File", "Role"], frontend_files, [3.3 * inch, 7.3 * inch], 7.3))

story.append(PageBreak())
story.append(h1("3. FRONTEND FLOW"))
story.append(h2("Entry Point"))
story.append(p("The browser loads prepai/index.html, which contains <div id=\"root\"></div> and a module script pointing to /src/main.jsx. main.jsx imports React, ReactDOM, index.css, and App.jsx, then renders <App /> inside React StrictMode."))
story.append(h2("How App.jsx Works"))
story += bullet([
    "App creates BrowserRouter -> AuthProvider -> AppRoutes.",
    "AuthProvider supplies user, login, register, logout, and loading to every route.",
    "ProtectedRoute reads useAuth(). If loading, it shows a centered PrepAI loading screen. If user exists, it renders children. Otherwise it redirects to /login and preserves the original location.",
    "Public routes /, /login, and /register redirect logged-in users to /dashboard.",
    "Protected routes /dashboard, /session, /interview, /report, and /coach are wrapped with Layout.",
])
story.append(h2("Routing Flow"))
route_rows = [
    ("/", "Landing page if logged out; redirect to /dashboard if logged in", "src/pages/landing/index.jsx"),
    ("/login", "Login form", "src/pages/Login.jsx"),
    ("/register", "Register form", "src/pages/Register.jsx"),
    ("/dashboard", "Protected dashboard", "src/pages/dashboard/index.jsx inside Layout"),
    ("/session", "Protected expression lab", "src/pages/session/index.jsx inside Layout"),
    ("/interview", "Protected mock interview", "src/features/interview/Interview.jsx inside Layout"),
    ("/report", "Protected report page", "src/pages/report/index.jsx inside Layout"),
    ("/coach", "Protected AI coach", "src/coach/Coach.jsx inside Layout"),
]
story.append(table(["Route", "Purpose", "Component"], route_rows, [1.5 * inch, 4.0 * inch, 5.0 * inch], 7.4))
story.append(h2("State Management"))
story += bullet([
    "There is no Redux/Zustand store. State is handled with React context plus local useState/useRef hooks.",
    "Auth state is global in AuthContext. Token and normalized user are stored in localStorage.",
    "Interview state lives in useInterviewController: mode, step, questions, answer, sessionId, emotionSummary, bodyLanguage, timers, and finalResult.",
    "Camera, canvas, timers, SpeechRecognition, and MediaStream are stored in refs inside useInterviewMedia.",
    "Report state is local to src/pages/report/index.jsx and is derived by buildReportData in src/pages/report/utils.js.",
    "Coach state lives in src/coach/useCoach/index.js.",
])
story.append(h2("Component Hierarchy"))
story.append(code("""main.jsx
  App.jsx
    BrowserRouter
      AuthProvider
        AppRoutes
          Public: Landing / Login / Register
          ProtectedRoute
            Layout
              Dashboard
              Session
              Interview
                useInterviewController
                InterviewUI
                  InterviewHeader
                  SetupStep
                    AnalysisPanel
                  QuestionStep
                    AnalysisPanel
                  ResultStep
                    AnalysisPanel
                  FinalStep
              Report
              Coach
                SetupScreen / ChatScreen / SummaryScreen"""))
story.append(h2("How Data Moves Between Components"))
story += bullet([
    "Interview.jsx reads URL mode and calls useInterviewController.",
    "useInterviewController returns { state, actions, refs }.",
    "InterviewUI receives those three objects and passes them to the correct step component.",
    "SetupStep edits state through action setters and calls actions.startInterview.",
    "QuestionStep reads currentQuestion and answer, calls actions.startSpeech, actions.stopSpeech, and actions.submitAnswer.",
    "AnalysisPanel receives videoRef/canvasRef and live signal state for display.",
    "ResultStep displays answerResult and can insert follow-up/adaptive questions or move to the next question.",
    "FinalStep displays finalResult from backend /interview/:sessionId/end and links to Report.",
])
story.append(h2("Component Responsibility Map"))
responsibility_rows = [
    ("Login", "src/pages/Login.jsx, useAuth.login in src/context/AuthContext.jsx, API.post('/auth/login')"),
    ("Signup", "src/pages/Register.jsx, useAuth.register, API.post('/auth/register')"),
    ("Interview setup", "src/features/interview/ui/SetupStep.jsx with state from useInterviewController"),
    ("Question display", "src/features/interview/ui/QuestionStep.jsx"),
    ("Camera", "src/features/interview/controller/useInterviewMedia.js and src/features/AnalysisPanel.jsx"),
    ("Microphone", "src/features/interview/speech.js and useInterviewMedia.startSpeech"),
    ("Answer result", "src/features/interview/ui/ResultStep.jsx"),
    ("Final interview result", "src/features/interview/ui/FinalStep.jsx"),
    ("Report page", "src/pages/report/index.jsx, sections.jsx, SessionReviewSection.jsx, utils.js"),
]
story.append(table(["Area", "Actual files/functions"], responsibility_rows, [2.1 * inch, 8.5 * inch], 7.4))
story.append(diagram("Frontend Flow Diagram", """Browser loads index.html
  -> src/main.jsx renders App
  -> App.jsx creates BrowserRouter + AuthProvider
  -> AuthContext restores token with GET /api/auth/me
  -> AppRoutes decides public/protected route
  -> Layout wraps protected pages
  -> Interview page:
       useInterviewController owns state/actions/refs
       InterviewUI chooses setup/question/result/final step
       useInterviewMedia owns camera, canvas, speech, timers
       API client sends protected requests with Bearer token"""))

story.append(PageBreak())
story.append(h1("4. BACKEND FLOW"))
story.append(h2("Backend Entry Point and Startup"))
story += bullet([
    "backend/server.js is the entry point declared in backend/package.json.",
    "dotenv.config() loads backend/.env.",
    "connectDB() from backend/config/db.js connects Mongoose to process.env.MONGO_URI.",
    "Express app is created and CORS is configured. CLIENT_URL can be a comma-separated allow list; otherwise all origins are allowed.",
    "express.json() and express.urlencoded() parse JSON and form bodies.",
    "Routes are mounted under /api/auth, /api/sessions, /api/expression, /api/speech, /api/coach, and /api/interview.",
    "GET / returns a simple health JSON message.",
    "A final error handler returns { success:false, message:'Internal Server Error', error }.",
    "The server listens on process.env.PORT or 5001 and handles EADDRINUSE and SIGINT gracefully.",
])
story.append(h2("Routes, Controllers, Services, Middleware"))
story += bullet([
    "Routes are thin mapping files in backend/routes.",
    "Controllers contain feature logic in backend/controllers/<feature>.controller.",
    "There is no separate service directory. AI-client helpers such as groqClient.js, hfConfig.js, aiClient.js, and shared.js act as service/helper modules.",
    "protect middleware verifies JWT and attaches req.user.",
    "upload middleware uses multer.memoryStorage for images/audio, allowing the backend to forward buffers to external AI services without saving files locally.",
])
story.append(h2("Database Connection Flow"))
story.append(code("""server.js
  dotenv.config()
  connectDB()
    mongoose.connect(process.env.MONGO_URI)
      success -> log MongoDB host
      failure -> log error and process.exit(1)
  app.listen(PORT || 5001)"""))
story.append(h2("Backend Architecture Diagram"))
story.append(code("""HTTP request
  -> Express route file
  -> protect middleware for private APIs
  -> multer upload middleware for image/audio APIs
  -> controller function
      -> Mongoose model read/write
      -> local scoring utility
      -> external AI service when needed
  -> JSON response to frontend

External AI calls:
  Groq SDK: interview questions, answer review, follow-ups, coach
  Gemini REST: speech text correction
  Hugging Face Gradio: facial expression recognition
  AI_SERVICE_URL: optional speech transcription"""))

story.append(PageBreak())
story.append(h1("5. AUTHENTICATION SYSTEM"))
story.append(h2("How Signup Works"))
story += bullet([
    "Frontend file: src/pages/Register.jsx collects name, email, and password.",
    "Register.jsx calls register(name, email, password) from AuthContext.",
    "AuthContext calls API.post('/auth/register', { name, email, password }).",
    "Backend route: POST /api/auth/register in routes/auth.routes.js.",
    "Controller: register in controllers/auth.controller/handlers.js.",
    "The controller checks User.findOne({ email }). If found, it returns 400 Email already registered.",
    "User.create({ name, email, password, role }) triggers UserSchema.pre('save'), which hashes the password with bcryptjs.",
    "The response includes success, message, token, and a safe user object without password.",
    "AuthContext stores token and user in localStorage, updates setUser, and Register.jsx navigates to /dashboard.",
])
story.append(h2("How Login Works"))
story += bullet([
    "Frontend file: src/pages/Login.jsx collects email and password.",
    "Login.jsx calls login(email, password) from AuthContext.",
    "AuthContext calls API.post('/auth/login', { email, password }).",
    "Backend route: POST /api/auth/login.",
    "Controller: login in auth.controller/handlers.js.",
    "Controller requires email/password, then User.findOne({ email }).select('+password').",
    "user.matchPassword(password) compares plain text input with the stored bcrypt hash.",
    "On success, controller returns token and user. On failure, it returns 401 Invalid credentials.",
    "AuthContext stores token/user, updates user state, and Login.jsx navigates to original protected route or /dashboard.",
])
story.append(h2("How JWT Sessions Work"))
story += bullet([
    "generateToken in auth.controller/token.js signs { id } using JWT_SECRET.",
    "JWT expiration uses JWT_EXPIRES_IN or default 7d.",
    "Axios request interceptor in src/api/index.js reads localStorage.token and adds Authorization: Bearer <token>.",
    "protect in backend/middleware/auth.middleware.js checks the Authorization header, verifies the JWT, loads User.findById(decoded.id), and attaches req.user.",
    "If token is missing, invalid, expired, or the user no longer exists, backend returns 401.",
    "Axios response interceptor clears localStorage and dispatches prepai:auth-unauthorized on 401.",
    "AuthContext listens for that event and sets user to null.",
])
story.append(h2("Complete Login Request Trace"))
story.append(code("""User types email/password in Login.jsx
  -> handleSubmit prevents default, sets loading
  -> useAuth().login(email, password)
  -> AuthContext API.post('/auth/login')
  -> src/api/index.js sends POST http://localhost:5001/api/auth/login
  -> backend/routes/auth.routes.js maps /login to login controller
  -> login controller validates body
  -> User.findOne({ email }).select('+password')
  -> user.matchPassword(password) uses bcrypt.compare
  -> generateToken(user._id)
  -> response { success, message, token, user }
  -> AuthContext stores token and user in localStorage
  -> setUser(authenticatedUser)
  -> Login.jsx navigate('/dashboard')
  -> AppRoutes now sees user and allows protected dashboard"""))

story.append(PageBreak())
story.append(h1("6. INTERVIEW QUESTION FLOW"))
story.append(h2("Where Questions Are Generated"))
story += bullet([
    "Active route: GET /api/interview/questions.",
    "Backend route file: backend/routes/interview.routes.js.",
    "Controller: generateQuestions in backend/controllers/interview.controller/questionHandlers.js.",
    "AI provider: Groq via backend/controllers/interview.controller/groqClient.js.",
    "Model: llama-3.3-70b-versatile.",
    "Prompt asks for exactly 5 questions for role, category, and difficulty, returned as JSON: { questions: [...] }.",
    "The controller maps each question into { question, category, difficulty, questionType:'primary', focusArea:category }.",
])
story.append(h2("AI-generated or Predefined?"))
story.append(p("The active interview questions are AI-generated. There is a Question model and an older Gemini-backed questionGen controller with a database fallback, but that router is not mounted in server.js. Therefore the mock interview UI depends on Groq for the active question generation path."))
story.append(h2("What Happens When User Clicks Start Interview"))
story.append(code("""SetupStep button -> actions.startInterview
  -> createInterviewActions.startInterview()
       Promise.all([
         API.get('/interview/questions?category=...&difficulty=...&role=...'),
         API.post('/interview/start')
       ])
  -> backend generates questions with Groq
  -> backend creates InterviewSession with uuid sessionId
  -> frontend normalizeQuestions()
  -> frontend setQuestions(), setSessionId(), setCurrentIdx(0)
  -> frontend reset answer/emotion/body-language state
  -> step becomes 'question' or 'live'
  -> beginQuestionTimers()
       analyzeFrame(sessionId) every 2000 ms
       elapsed timer every 1000 ms
       live countdown every 1000 ms in live mode
  -> speak(first question) using SpeechSynthesis"""))
story.append(h2("Complete Request Lifecycle"))
story += bullet([
    "Frontend caller: src/features/interview/controller/actions.js startInterview.",
    "Request 1: GET /api/interview/questions?category=<category>&difficulty=<difficulty>&role=<role>.",
    "Request 2: POST /api/interview/start.",
    "Question response populates React state questions.",
    "Start response provides session.sessionId, which is used in all later answer/end requests.",
    "The generated question list is not saved directly at start; individual question/answer pairs are stored when each answer is submitted.",
])

story.append(PageBreak())
story.append(h1("7. CAMERA FLOW"))
story.append(h2("When Camera Permission Appears"))
story.append(p("In interview mode, useInterviewController calls startCamera() automatically on component mount. The browser permission prompt appears because useInterviewMedia.startCamera calls navigator.mediaDevices.getUserMedia({ video: true, audio: false }). In Expression lab, useSessionAnalysis also calls startCamera on mount. In Coach, camera starts after the user clicks Start Coaching Session."))
story.append(h2("Browser API and Capture Process"))
story += bullet([
    "Browser API: navigator.mediaDevices.getUserMedia.",
    "The returned MediaStream is saved in streamRef and assigned to videoRef.current.srcObject.",
    "The visible video element is rendered in AnalysisPanel, Session page, or Coach ChatScreen.",
    "A hidden canvas receives frames with canvas.getContext('2d').drawImage(video, 0, 0).",
    "canvas.toBlob(resolve, 'image/jpeg', 0.8) converts the frame to an in-memory JPEG blob.",
    "The frontend creates FormData and appends image as frame.jpg or coach-frame.jpg.",
    "During interview questions, frames are processed every 2000 ms. During coach chat, every 2500 ms. During expression lab, every 2000 ms after Start session.",
])
story.append(h2("Is Video Sent to Backend?"))
story.append(p("Continuous video is not sent. The app sends individual JPEG still frames to POST /api/expression/analyze. Frames are held in memory in the browser and then in multer memory storage on the backend. The backend forwards each frame to the Hugging Face Gradio service for prediction. The repository does not save raw frame images to disk."))
story.append(h2("Where Results Are Stored"))
story += bullet([
    "Interview page: expression counts stay in React state as emotionSummary and are submitted with the answer to /api/interview/answer. They are then stored inside InterviewSession.answers[].emotionSummary.",
    "Expression lab: a real Session document is created through /api/sessions/start. Expression controller can find that sessionId and pushes expressionLog plus increments expressionSummary.",
    "Coach: frames are analyzed without a Mongo sessionId. Expression counts stay in React state and are sent to /api/coach/summary at the end. They are not stored in a collection.",
])
story.append(diagram("Step-by-step Camera Flow Diagram", """Interview component mounts
  -> useInterviewController useEffect calls startCamera()
  -> navigator.mediaDevices.getUserMedia({ video:true, audio:false })
  -> browser asks user to Allow Camera
  -> streamRef stores MediaStream
  -> videoRef.srcObject = stream
  -> AnalysisPanel renders live video

When interview question starts
  -> beginQuestionTimers(sessionId)
  -> setInterval every 2000 ms
  -> draw video frame to hidden canvas
  -> canvas.toBlob('image/jpeg', quality 0.8)
  -> FormData { image, sessionId }
  -> POST /api/expression/analyze
  -> backend multer memory upload
  -> Hugging Face Gradio expression model
  -> response { expression, confidence, face_detected }
  -> frontend updates currentEmotion, emotionSummary, bodyLanguage
  -> /api/interview/answer later saves emotionSummary per answer"""))

story.append(PageBreak())
story.append(h1("8. MICROPHONE FLOW"))
story.append(h2("Main Interview Microphone Flow"))
story += bullet([
    "Component: src/features/interview/ui/QuestionStep.jsx has the Use Voice / Stop Mic button.",
    "Button calls actions.startSpeech or actions.stopSpeech from useInterviewController.",
    "startSpeech comes from useInterviewMedia and calls startSpeechRecognition from src/features/interview/speech.js.",
    "Browser API: window.SpeechRecognition || window.webkitSpeechRecognition.",
    "Interview recognition is continuous = true. Every onresult event rebuilds the transcript from e.results and writes it into the answer textarea through setAnswer(transcript).",
    "No audio Blob is created, no local audio file is stored, and no audio is uploaded in the main interview path.",
    "The text transcript is submitted as originalAnswer to /api/interview/answer.",
])
story.append(h2("Coach Microphone Flow"))
story += bullet([
    "Component: src/coach/ChatScreen.jsx Use Voice button calls startListening/stopListening from useCoachSpeech.",
    "Browser API: SpeechRecognition/webkitSpeechRecognition.",
    "Coach recognition is continuous = false, interimResults = false, lang = en-US.",
    "The recognized phrase is placed into the chat input, then sendMessage sends it as text to /api/coach/message.",
])
story.append(h2("Backend Audio Upload Route"))
story += bullet([
    "Route exists: POST /api/speech/transcribe, protected, upload.single('audio').",
    "Allowed extensions in upload.middleware.js: mp3, wav, ogg, webm, m4a.",
    "transcribeAudio in speech.controller/transcribe.js forwards the in-memory file to process.env.AI_SERVICE_URL + '/transcribe'.",
    "Expected external transcription response: { text: '<transcribed text>' }.",
    "Then req.body.originalText is set to transcribedText and correctText(req,res) is called.",
    "This route is not called by the current React frontend based on the API search.",
])
story.append(h2("Speech Correction Route"))
story += bullet([
    "Route: POST /api/speech/correct-text.",
    "Controller: correctText in speech.controller/correct.js.",
    "Input: originalText, optional sessionId, optional expressionAtTime.",
    "Uses Gemini 2.0 Flash REST endpoint to return correctedText and corrections.",
    "Creates a Transcript document and increments Session.totalCorrections if a matching active Session exists.",
])
story.append(diagram("Complete Audio Processing Flow", """Main interview current flow:
User clicks Use Voice
  -> SpeechRecognition starts in browser
  -> spoken words become transcript text
  -> textarea answer state updates
  -> Submit Answer sends text to /api/interview/answer
  -> backend scores and stores answer

Optional backend speech route:
Frontend would upload audio file
  -> POST /api/speech/transcribe with multipart field 'audio'
  -> multer memory buffer
  -> AI_SERVICE_URL/transcribe
  -> transcribed text
  -> correctText()
  -> Gemini correction
  -> Transcript saved in MongoDB"""))

story.append(PageBreak())
story.append(h1("9. BODY LANGUAGE ANALYSIS"))
story.append(h2("Where Body-language Logic Lives"))
story += bullet([
    "Frontend file: prepai/src/features/interview/bodyLanguage.js.",
    "Display file: prepai/src/features/AnalysisPanel.jsx.",
    "Input source: response object from /api/expression/analyze passed into buildBodyLanguageSnapshot.",
    "Current backend expression response: { success, expression, confidence, face_detected }.",
    "The bodyLanguage parser supports future fields like bodyLanguage, body_language, bodyMetrics, mediaPipe, posture, eyeContact, confidenceLevel, headStability, and handMovement.",
])
story.append(h2("MediaPipe Integration Status"))
story.append(p("The current repository does not include @mediapipe packages, MediaPipe imports, pose landmark extraction, face mesh, or hand landmark processing. bodyLanguage.js contains comments and parsing support for MediaPipe-like payloads, but the backend expression controller does not produce those payloads. Therefore posture, head movement, and hand movement usually remain in 'Awaiting ...' state unless another service starts returning those keys."))
metric_rows = [
    ("Posture", "Expected payload keys: posture, postureStatus, posture_status", "statusFromToken or score thresholds: good/upright/straight -> Good; average/slouching/leaning -> Needs Improvement; poor/bad -> Poor. Current backend does not return it.", "bodyLanguage.metrics.posture, shown in AnalysisPanel Body language panel."),
    ("Eye contact", "Payload eyeContact/gaze/lookingAtCamera OR expression response face_detected", "If explicit token/score exists, parse it. Otherwise deriveEyeContactFromFace: face_detected true -> Good; false -> Poor. Warnings skipped when expression endpoint returns warning.", "bodyLanguage.metrics.eyeContact and live alerts Maintain Eye Contact / Avoid Looking Away."),
    ("Confidence", "Payload confidenceLevel/presenceConfidence OR expression + confidence + face_detected", "If face not detected -> Low. If expression is happy/neutral/surprise and confidence >= 65 -> High. If confidence < 35 -> Low. Stress expressions sad/fear/angry/disgust -> Average.", "bodyLanguage.metrics.confidence; answer confidenceScore is separately calculated on backend from emotionSummary."),
    ("Head movement", "Expected payload headStability/head_movement/headMovement", "Score >= 70 -> Stable, 40-69 -> Average, <40 -> Unstable. Tokens stable/steady/good -> Stable; average/moderate -> Average; unstable/poor/excess -> Unstable.", "bodyLanguage.metrics.headStability and alert Keep Your Head Stable."),
    ("Hand movement", "Expected payload handMovement/hand_activity/handActivity", "Score <= 35 -> Calm, 36-70 -> Active, >70 -> Excess. Tokens none/minimal/low/calm -> Calm; moderate/active -> Active; high/excessive -> Excess.", "bodyLanguage.metrics.handMovement and alert Reduce Excessive Hand Movement."),
]
story.append(table(["Metric", "Data source", "Calculation logic", "Output location"], metric_rows, [1.3 * inch, 2.6 * inch, 4.2 * inch, 2.6 * inch], 6.9))
story.append(h2("How Confidence Is Calculated for Stored Interview Answers"))
story.append(p("Backend answer scoring uses calculateConfidenceScore in backend/utils/scoreCalculator.js. It sums emotionSummary values. If no emotion data exists, it derives confidence from grammarScore and fillerScore. If emotion data exists, confidence = (happy + neutral) / total emotion frames * 100. This confidenceScore is then combined with speech sentiment to produce multimodalScore."))

story.append(PageBreak())
story.append(h1("10. EXPRESSION ANALYSIS"))
story.append(h2("How Facial Expressions Are Detected"))
story += bullet([
    "Frontend captures image frames from the webcam video using a hidden canvas.",
    "Frontend posts FormData with field image to /api/expression/analyze.",
    "Backend route protects the endpoint with JWT and uses multer memory storage.",
    "Controller analyzeExpression uploads the image buffer to Hugging Face Gradio temporary storage at /gradio_api/upload.",
    "Then it calls /gradio_api/call/predict_emotion with the uploaded file path.",
    "The controller receives an event_id and reads the SSE completion payload from /call/predict_emotion/<event_id>.",
    "parseSseCompletePayload extracts the final data line.",
    "parseHfPredictions in hfConfig.js normalizes labels to one of angry, disgust, fear, happy, neutral, sad, surprise.",
    "The backend returns expression, confidence rounded to percentage, and face_detected.",
])
story.append(h2("Library/Model Used"))
story += bullet([
    "Frontend processing: native browser canvas and MediaDevices only.",
    "Backend processing: axios + form-data to a Hugging Face Gradio Space.",
    "Hosted model endpoint: https://mir-sajad-01-facial-expression-recognition.hf.space/gradio_api/call/predict_emotion.",
    "No local TensorFlow, face-api.js, OpenCV, or MediaPipe model is imported in the current code.",
])
story.append(diagram("Expression Analysis Flow", """Canvas frame Blob
  -> POST /api/expression/analyze
  -> routes/expression.routes.js
  -> protect middleware
  -> upload.single('image') memory buffer
  -> analyzeExpression()
       check per-user inFlight guard
       upload to Hugging Face Gradio /upload
       call /call/predict_emotion
       read SSE complete payload
       parse and normalize label
       optionally update Session expressionLog/summary
  -> response to frontend
  -> frontend updates currentEmotion and emotionSummary
  -> interview answer later stores summary in InterviewSession.answers"""))

story.append(PageBreak())
story.append(h1("11. API MAP"))
api_rows = [
    ("GET /", "GET", "None", "{ message }", "Browser/manual health check", "backend/server.js inline handler"),
    ("/api/auth/register", "POST", "{ name, email, password, role? }", "{ success, message, token, user }", "AuthContext.register via Register.jsx", "auth.controller/handlers.js register"),
    ("/api/auth/login", "POST", "{ email, password }", "{ success, message, token, user }", "AuthContext.login via Login.jsx", "auth.controller/handlers.js login"),
    ("/api/auth/me", "GET", "Bearer token", "{ success, user }", "AuthContext restoreSession", "auth.controller/handlers.js getMe"),
    ("/api/sessions/start", "POST", "Bearer token", "{ success, message, session }", "session/useSessionAnalysis.js startSession", "session.controller/sessionLifecycle.js startSession"),
    ("/api/sessions/report", "GET", "Bearer token", "{ success, report }", "dashboard/index.jsx", "session.controller/sessionQueries.js getUserReport"),
    ("/api/sessions", "GET", "Bearer token", "{ success, count, sessions }", "dashboard/index.jsx", "session.controller/sessionQueries.js getUserSessions"),
    ("/api/sessions/:sessionId", "GET", "Bearer token", "{ success, session, transcripts }", "No active frontend caller found", "session.controller/sessionQueries.js getSessionById"),
    ("/api/sessions/:sessionId/end", "PUT", "Bearer token", "{ success, message, session }", "session/useSessionAnalysis.js endSession", "session.controller/sessionLifecycle.js endSession"),
    ("/api/expression/analyze", "POST", "multipart image, optional sessionId", "{ success, expression, confidence, face_detected, warning? }", "useInterviewMedia, useSessionAnalysis, useCoachCamera", "expression.controller/analyze.js analyzeExpression"),
    ("/api/speech/start", "POST", "Bearer token", "{ success, message }", "No active frontend caller found", "speech.routes.js inline placeholder"),
    ("/api/speech/correct-text", "POST", "{ originalText, sessionId?, expressionAtTime? }", "{ success, originalText, correctedText, corrections, transcriptId }", "No active frontend caller found", "speech.controller/correct.js correctText"),
    ("/api/speech/transcribe", "POST", "multipart audio", "On success same as correctText; on AI failure 502", "No active frontend caller found", "speech.controller/transcribe.js transcribeAudio"),
    ("/api/speech/transcripts/:sessionId", "GET", "Bearer token", "{ success, count, transcripts }", "No active frontend caller found", "speech.controller/transcripts.js getSessionTranscripts"),
    ("/api/coach/start", "POST", "{ topic }", "{ success, openingQuestion, message }", "coach/useCoach/index.js startSession", "coach.controller/session.js startCoaching"),
    ("/api/coach/message", "POST", "{ message, history, duration? }", "{ success, coachResponse, feedback, stats }", "coach/useCoach/index.js sendMessage", "coach.controller/message.js sendMessage"),
    ("/api/coach/summary", "POST", "{ messages, emotionSummary, emotionLog }", "{ success, summary, stats }", "coach/useCoach/index.js endSession", "coach.controller/session.js getCoachSummary"),
    ("/api/interview/questions", "GET", "query category, difficulty, role", "{ success, questions }", "features/interview/controller/actions.js startInterview", "interview.controller/questionHandlers.js generateQuestions"),
    ("/api/interview/start", "POST", "Bearer token", "{ success, session }", "features/interview/controller/actions.js startInterview", "interview.controller/sessionHandlers.js startInterview"),
    ("/api/interview/answer", "POST", "{ sessionId, question, originalAnswer, duration, emotionSummary, dominantEmotion, questionType, focusArea, category, difficulty, role }", "{ success, result }", "features/interview/controller/actions.js submitAnswer", "interview.controller/answerHandlers.js submitAnswer"),
    ("/api/interview/:sessionId/end", "PUT", "Bearer token", "{ success, result }", "actions.js nextQuestion/endInterviewNow", "interview.controller/sessionHandlers.js endInterview"),
    ("/api/interview/history", "GET", "Bearer token", "{ success, sessions }", "dashboard/index.jsx, report/index.jsx", "routes/interview.routes.js inline history handler"),
    ("/api/interview/:sessionId", "GET", "Bearer token", "{ success, session }", "No active frontend caller found", "routes/interview.routes.js inline session handler"),
    ("/api/questions/generate", "GET", "query category, difficulty, count, role", "{ success, questions, source }", "Inactive - route not mounted", "questionGen.controller/generate.js generateQuestions"),
]
story.append(table(["Endpoint", "Method", "Request Payload", "Response Payload", "Frontend Caller", "Backend Handler"], api_rows, [1.95 * inch, 0.55 * inch, 2.15 * inch, 2.0 * inch, 2.1 * inch, 2.25 * inch], 5.9))

story.append(PageBreak())
story.append(h1("12. DATABASE ANALYSIS"))
story.append(h2("Database and Collections"))
story.append(p("The database is MongoDB accessed through Mongoose. Mongoose pluralizes model names into collections. The actual schema definitions are in backend/models."))
schema_rows = [
    ("User", "users", "name, email, password, role, totalSessions, createdAt, timestamps", "Stores registered users. Password is select:false and hashed before save."),
    ("Session", "sessions", "user, sessionId, startTime, endTime, duration, expressionLog, expressionSummary, dominantExpression, totalCorrections, status", "Expression lab / speech correction session. Referenced by Transcript."),
    ("Transcript", "transcripts", "user, session, originalText, correctedText, corrections, expressionAtTime, timestamp", "Stores grammar-corrected speech/text records tied to a Session."),
    ("Question", "questions", "question, category, difficulty, tips", "Predefined question bank/fallback for the older unmounted question route."),
    ("InterviewSession", "interviewsessions", "user, sessionId, status, answers[], totalScore, totalDuration, overallFeedback, startTime, endTime", "Main mock interview storage. Answers are embedded subdocuments."),
]
story.append(table(["Model", "Collection", "Important fields", "Purpose"], schema_rows, [1.3 * inch, 1.4 * inch, 4.5 * inch, 3.4 * inch], 7.0))
story.append(h2("Relationships"))
story += bullet([
    "User -> Session: Session.user is an ObjectId ref to User.",
    "User -> InterviewSession: InterviewSession.user is an ObjectId ref to User.",
    "User -> Transcript: Transcript.user is an ObjectId ref to User.",
    "Session -> Transcript: Transcript.session is an ObjectId ref to Session.",
    "InterviewSession -> answers: answers are embedded inside the InterviewSession document, not separate collection documents.",
    "Question is standalone and not referenced by active interview sessions.",
])
story.append(h2("Report Storage"))
story.append(p("There is no separate Report model. Reports are computed on demand in the frontend from InterviewSession history. The report page fetches /api/interview/history, then buildReportData in src/pages/report/utils.js derives averages, score trends, emotion totals, dominant emotion, filler patterns, focus patterns, and recommendations."))
story.append(h2("Schema Notes and Risks"))
story += bullet([
    "Transcript.session is required, but speech.controller/correct.js can attempt Transcript.create with session:null when sessionId is missing or not found. That can fail validation if the speech correction route is used without a valid Session.",
    "Session expressionSummary uses keys surprise/fear/disgust, but getUserReport initializes surprised/fearful/disgusted. Those mismatched keys can produce zero totals for those expressions in the older sessions report.",
    "InterviewSession.totalDuration is defined but endInterview does not currently compute it from answer durations.",
])

story.append(PageBreak())
story.append(h1("13. COMPLETE USER JOURNEY"))
story.append(h2("Landing Page -> Login"))
story += bullet([
    "Landing page is src/pages/landing/index.jsx. It shows PrepAI marketing content and links to /login and /register.",
    "Login page is src/pages/Login.jsx. It uses useAuth.login.",
    "AuthContext posts to /api/auth/login. Backend validates credentials and returns JWT.",
    "Token/user are stored in localStorage. AppRoutes sees user and redirects to /dashboard.",
])
story.append(h2("Dashboard -> Interview Setup"))
story += bullet([
    "Dashboard is src/pages/dashboard/index.jsx.",
    "It fetches /sessions/report, /sessions, and /interview/history for stats.",
    "Start session link points to /interview?mode=live. Tasks also link to /interview?mode=practice.",
    "Interview.jsx reads the mode query param and passes initialMode to useInterviewController.",
    "SetupStep lets the user choose practice/live, timer, target role, category, and difficulty.",
])
story.append(h2("Camera Permission -> Microphone Permission"))
story += bullet([
    "Interview controller starts camera on mount, causing browser camera permission prompt.",
    "Video stream is displayed in AnalysisPanel.",
    "Microphone permission appears only when the user clicks Use Voice, because SpeechRecognition starts then.",
    "The code does not call getUserMedia({ audio:true }) in interview mode. SpeechRecognition is browser-provided speech-to-text.",
])
story.append(h2("Question Generation -> Answer Recording"))
story += bullet([
    "Begin Session calls GET /interview/questions and POST /interview/start in parallel.",
    "Groq generates 5 questions. MongoDB stores a new InterviewSession.",
    "QuestionStep displays the current question. SpeechSynthesis can read it aloud.",
    "User types or uses speech recognition. Answer text is held in React state.",
    "Every 2 seconds the camera frame is sent to /expression/analyze, and emotionSummary updates in frontend state.",
])
story.append(h2("Analysis -> Report Generation"))
story += bullet([
    "Submit Answer posts question, answer, duration, emotionSummary, dominantEmotion, metadata, and sessionId to /interview/answer.",
    "Backend detects filler words, calculates WPM, asks Groq for grammar/relevance/structure/feedback/improvedText, generates follow-ups and adaptive questions, calculates scores, and pushes answerData into InterviewSession.answers.",
    "After last question or End Interview, frontend sends PUT /interview/:sessionId/end.",
    "Backend asks Groq for an under-80-word session summary, marks status completed, sets endTime, computes average totalScore, and saves the session.",
    "Report page fetches /interview/history and computes report metrics in frontend utils.",
])
story.append(diagram("Complete User Journey Data Flow", """Landing
  -> Login/Register
  -> AuthContext stores JWT
  -> Dashboard fetches summaries/history
  -> Interview setup
  -> Camera stream starts locally
  -> Begin Session
       GET /interview/questions -> Groq questions
       POST /interview/start -> InterviewSession in MongoDB
  -> For each question
       browser SpeechRecognition -> answer text
       camera canvas frame -> /expression/analyze -> expression result
       Submit Answer -> /interview/answer -> scores + answer stored
  -> Finish
       PUT /interview/:sessionId/end -> completed InterviewSession
  -> Report
       GET /interview/history -> buildReportData -> visual report"""))

story.append(PageBreak())
story.append(h1("14. VIVA PREPARATION SECTION"))
qa = [
    ("What is the main purpose of VivaCoach-AI?", "It helps users practice interviews and communication by combining AI-generated questions, answer scoring, facial expression analysis, speech/text input, and reports."),
    ("What architecture does the project use?", "It uses a React/Vite single-page frontend and an Express/Mongoose backend connected to MongoDB. The frontend calls REST APIs through Axios."),
    ("What is the frontend entry point?", "prepai/index.html loads src/main.jsx. main.jsx renders App.jsx inside React StrictMode."),
    ("What is the backend entry point?", "backend/server.js. It loads env variables, connects to MongoDB, mounts Express routes, and starts the server on PORT or 5001."),
    ("How does authentication work?", "Users register/login through /api/auth. Passwords are hashed with bcryptjs. The backend returns a JWT. The frontend stores it in localStorage and Axios adds it as Bearer token."),
    ("Where are users stored?", "In MongoDB through backend/models/User.js. The schema stores name, email, hashed password, role, totalSessions, and timestamps."),
    ("How is the login request traced?", "Login.jsx -> AuthContext.login -> API.post('/auth/login') -> auth.routes.js -> login controller -> User.findOne + bcrypt compare -> JWT response -> localStorage -> dashboard."),
    ("How are interview questions generated?", "The active route is GET /api/interview/questions. questionHandlers.js sends a prompt to Groq llama-3.3-70b-versatile and parses JSON questions."),
    ("Are questions predefined?", "The active mock interview questions are AI-generated. A Question model and older Gemini route exist, but /api/questions is commented out in server.js."),
    ("What happens when Begin Session is clicked?", "actions.startInterview calls /interview/questions and /interview/start in parallel, stores questions and sessionId, resets state, starts timers, starts frame analysis, and speaks the first question."),
    ("Where is an interview session stored?", "In InterviewSession collection. It stores user, sessionId, status, embedded answers, totalScore, overallFeedback, startTime, and endTime."),
    ("How is an answer analyzed?", "POST /api/interview/answer sends text, duration, emotion summary, and metadata. Backend calculates fillers/WPM, asks Groq for evaluation, calculates scores, generates follow-up/adaptive questions, and stores the answer."),
    ("How is overall interview score calculated?", "Each answer gets an overallScore from multimodal, grammar, speech, filler, relevance, and structure scoring. endInterview averages answer overallScore values into session.totalScore."),
    ("How are filler words detected?", "scoreCalculator.js scans the lowercased answer against a FILLER_WORDS list using word-boundary regex matches."),
    ("How is words per minute calculated?", "calculateWordsPerMinute counts words in the answer and divides by durationSeconds / 60."),
    ("How is confidence calculated?", "For answers, calculateConfidenceScore uses happy + neutral emotion counts divided by total emotion frames. If no frames exist, it estimates from grammar and filler scores."),
    ("How does camera processing work?", "The frontend gets a webcam stream with getUserMedia, draws frames to a hidden canvas, converts to JPEG Blob, and posts one frame at intervals to /api/expression/analyze."),
    ("Is complete video sent to the backend?", "No. The app sends individual JPEG frames, not continuous video streams or saved video files."),
    ("Which backend file handles expression analysis?", "backend/controllers/expression.controller/analyze.js, with route backend/routes/expression.routes.js."),
    ("Which facial expression model is used?", "A Hugging Face Gradio Space at mir-sajad-01-facial-expression-recognition.hf.space, called through /gradio_api/upload and /call/predict_emotion."),
    ("Where are expression results stored?", "In main interview, emotionSummary is stored per answer in InterviewSession. In Expression lab, expressionLog and expressionSummary are stored in Session. In Coach, they are used in summary but not stored."),
    ("How is microphone input handled?", "The main interview and coach use browser SpeechRecognition to convert speech to text locally in the browser. The resulting text is submitted to backend APIs."),
    ("Is backend audio transcription used by the current UI?", "No active frontend caller uses /api/speech/transcribe. The route exists for uploading audio to AI_SERVICE_URL/transcribe."),
    ("How is speech converted to text?", "In the current UI, through the browser Web Speech API. In the unused backend route, an external AI_SERVICE_URL transcribes uploaded audio."),
    ("How is body language detected?", "The UI derives eye contact and confidence from face_detected/expression data. It can parse posture/head/hand fields if provided, but the current backend does not return real MediaPipe pose data."),
    ("Is MediaPipe actually integrated?", "No. bodyLanguage.js supports MediaPipe-like payload keys, but there are no MediaPipe packages/imports and the backend expression route does not output landmarks."),
    ("How does the report page work?", "Report.jsx fetches /api/interview/history and buildReportData computes averages, trends, comparison, emotion totals, top fillers, focus areas, and recommendations on the frontend."),
    ("Why use MongoDB?", "The project stores flexible session documents with embedded answer arrays and variable AI-analysis fields. MongoDB/Mongoose fits this document-style data well."),
    ("What external AI services are used?", "Groq for interview and coach LLM work, Gemini for grammar correction and older question generation, Hugging Face Gradio for expressions, and optional AI_SERVICE_URL for audio transcription."),
    ("What would you improve next?", "Add real MediaPipe body landmark processing, persist coach sessions, compute InterviewSession.totalDuration, fix Session report expression key mismatches, and connect or remove unused speech/question routes."),
]
qa_rows = [(str(i + 1), q, a) for i, (q, a) in enumerate(qa)]
story.append(table(["#", "Likely examiner question", "Simple answer based on code"], qa_rows, [0.35 * inch, 4.0 * inch, 6.1 * inch], 6.9))

story.append(PageBreak())
story.append(h1("15. PROJECT SUMMARY"))
story.append(h2("High-level Architecture Diagram"))
story.append(code("""User Browser
  -> React/Vite PrepAI SPA
       AuthContext + React Router + Axios
       Interview/Coach/Report/Expression Lab
       Camera + Web Speech APIs
  -> Express REST API
       Auth/session/interview/coach/expression/speech routes
       JWT middleware + multer memory uploads
       Groq/Gemini/Hugging Face integrations
  -> MongoDB
       User, InterviewSession, Session, Transcript, Question"""))
story.append(h2("Frontend Architecture Diagram"))
story.append(code("""App.jsx
  AuthProvider
    ProtectedRoute
      Layout
        Dashboard
        Interview
          useInterviewController
            createInterviewActions
            useInterviewMedia
            bodyLanguage helpers
          InterviewUI
            Header, SetupStep, QuestionStep, ResultStep, FinalStep
            AnalysisPanel
        Report
          buildReportData + sections
        Coach
          useCoachLogic
          SetupScreen, ChatScreen, SummaryScreen
        Session
          useSessionAnalysis"""))
story.append(h2("Backend Architecture Diagram"))
story.append(code("""server.js
  /api/auth       -> auth.routes       -> auth.controller       -> User
  /api/sessions   -> session.routes    -> session.controller    -> Session, Transcript, User
  /api/interview  -> interview.routes  -> interview.controller  -> InterviewSession, Groq, scoreCalculator
  /api/expression -> expression.routes -> expression.controller -> Hugging Face Gradio, Session
  /api/speech     -> speech.routes     -> speech.controller     -> AI_SERVICE_URL, Gemini, Transcript
  /api/coach      -> coach.routes      -> coach.controller      -> Groq, scoreCalculator

Shared middleware:
  protect -> JWT verification
  upload  -> multer memory image/audio parsing"""))
story.append(h2("Data Flow Diagram"))
story.append(code("""Auth data:
Login/Register -> JWT -> localStorage -> Axios Bearer header -> protected APIs

Interview data:
Setup -> Groq questions + InterviewSession
Answer text + duration + emotionSummary -> /interview/answer
  -> answer scoring -> InterviewSession.answers[]
Finish -> /interview/:sessionId/end -> totalScore + overallFeedback
Report -> /interview/history -> buildReportData -> UI charts/sections

Expression data:
Camera frame -> /expression/analyze -> Hugging Face Gradio
  -> expression/confidence/face_detected
  -> frontend emotionSummary
  -> saved per answer or expression lab session"""))
story.append(h2("AI Processing Pipeline Diagram"))
story.append(code("""Interview question AI:
Prompt(role/category/difficulty) -> Groq -> JSON questions

Answer evaluation AI:
Question + answer + dominant emotion -> Groq
  -> grammarScore, relevanceScore, structureScore, feedback, improvedText
Answer + context -> Groq
  -> followUps + adaptiveQuestions
Local scoreCalculator
  -> filler, WPM, confidence, speech, sentiment, multimodal, overall

Expression AI:
JPEG frame -> Hugging Face Gradio upload -> predict_emotion SSE
  -> normalized label + confidence

Speech correction AI:
Text -> Gemini 2.0 Flash -> correctedText + corrections

Coach AI:
Topic/history/message -> Groq -> coachResponse + feedback
Messages + emotionSummary -> Groq + local scoring -> final summary"""))
story.append(h2("Verification Performed"))
story += bullet([
    "Frontend build: npm run build in prepai succeeded. Vite transformed 839 modules and produced dist assets. Only warning was chunk size above 500 kB.",
    "Backend syntax: node --check passed for backend JavaScript source files outside node_modules.",
])


doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=landscape(A4),
    rightMargin=0.38 * inch,
    leftMargin=0.38 * inch,
    topMargin=0.42 * inch,
    bottomMargin=0.48 * inch,
    title="VivaCoach-AI Codebase Documentation Report",
    author="Codex",
)

doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
print(OUTPUT)
