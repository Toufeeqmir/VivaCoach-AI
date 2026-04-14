# VivaCoach-AI

AI-powered interview practice platform with real-time communication feedback.

This project includes:
- `backend`: Node.js + Express API (auth, sessions, interview, coach, expression/speech analysis)
- `prepai`: React + Vite frontend

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), JWT
- AI integrations: Hugging Face endpoint and LLM providers via API keys

## Project Structure

```text
.
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
└── prepai/
    ├── src/
    │   ├── api/
    │   ├── coach/
    │   ├── features/
    │   └── pages/
    └── vite.config.js
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally or a cloud MongoDB URI

## Backend Setup (`backend`)

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file inside `backend` and configure:
   ```env
   PORT=5001
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/facial_speech_db
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d

   GEMINI_API_KEY=your_key
   GROQ_API_KEY=your_key

   AI_SERVICE_URL=https://your-ai-service-url
   HF_MODEL_URL=https://your-hf-model-endpoint
   HF_API_TOKEN=your_hf_token
   ```

3. Start the backend:
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

## Frontend Setup (`prepai`)

1. Install dependencies:
   ```bash
   cd prepai
   npm install
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```
   By default, Vite runs on `http://localhost:5173`.

## Common Development Workflow

Run backend and frontend in separate terminals:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd prepai
npm run dev
```

## Security Note

Do not commit `.env` or real API keys/tokens to GitHub. Rotate secrets immediately if they were exposed.