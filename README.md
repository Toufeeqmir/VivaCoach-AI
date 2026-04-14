# VivaCoach-AI

VivaCoach-AI is an interview practice platform that helps users improve communication by combining:
- spoken answers (content quality + delivery)
- facial/body signals from camera frames
- conversation context from an AI coach

The app guides users through mock interviews, analyzes performance, and provides actionable feedback to build clarity, confidence, and presence.

This repository includes:
- `backend`: Node.js + Express API for auth, sessions, interview orchestration, scoring, and AI integrations
- `prepai`: React + Vite frontend for interview flow, coach UI, and reports

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), JWT
- AI integrations: Hugging Face vision endpoint + LLM providers (Gemini/Groq) via API keys

## What The Project Does

VivaCoach-AI is designed for interview preparation with a practical loop:
1. User signs in and starts an interview/coaching session
2. Frontend captures user responses and sends them to backend services
3. Backend processes multimodal signals (text/audio/video-derived inputs)
4. Scoring and coaching logic generate feedback
5. User sees report + next-step coaching suggestions

Core outcomes:
- Improve answer structure and relevance
- Improve communication style (pace, confidence cues, expression consistency)
- Track progress across sessions

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

## Multimodal Pipeline (How It Works)

VivaCoach-AI uses a multimodal approach, meaning it does not rely on just one signal.

- **Text/semantic signal**
  - User answers are evaluated for quality, relevance, and structure.
  - Interview logic and scoring modules convert response quality into report metrics.

- **Speech/audio-derived signal**
  - Speech-related inputs are used for communication feedback (clarity and delivery dimensions).
  - Backend speech/interview controllers combine these inputs with answer-level evaluation.

- **Visual expression signal**
  - Camera frames are analyzed through configured expression endpoints (Hugging Face / AI service URL).
  - Emotion/expression outputs are used as non-verbal communication indicators.

- **Fusion + coaching**
  - Backend combines these signals into session-level scoring and coaching feedback.
  - Frontend report/coach screens present strengths, weaknesses, and specific improvement advice.

In short: **VivaCoach-AI fuses content quality + vocal delivery + non-verbal cues** to produce richer interview coaching than a text-only evaluator.

## Main Features

- JWT-based authentication and protected session flows
- Interview session lifecycle management
- AI-assisted answer review and coaching suggestions
- Expression analysis integration for non-verbal feedback
- Speech/interview scoring paths for performance summaries
- Report UI for post-session insights and follow-up practice

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

   Notes:
   - `AI_SERVICE_URL` and `HF_MODEL_URL` should point to valid model endpoints used by your expression pipeline.
   - Keep all keys/tokens private.

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

## API Surface (High Level)

Backend exposes routes under:
- `/api/auth`
- `/api/sessions`
- `/api/interview`
- `/api/coach`
- `/api/expression`
- `/api/speech`

These routes coordinate user auth, session state, interview processing, and multimodal analysis.

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

## Typical User Flow

1. Sign in
2. Start an interview/coach session
3. Submit responses while communication signals are captured/analyzed
4. Receive AI-generated feedback and scores
5. Review report and repeat with targeted practice

## Security Note

Do not commit `.env` or real API keys/tokens to GitHub. Rotate secrets immediately if they were exposed.