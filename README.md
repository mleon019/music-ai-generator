# TFG music-ai-generator

## Backend (I1)

1. Copy `backend/.env.example` to `backend/.env` and set `GROQ_API_KEY`

## Frontend (I2)

1. Copy `frontend/.env.example` to `frontend/.env`
2. Install deps: `cd frontend` then `npm install`
3. Start dev server: `npm run dev`

## Docker (full stack)

Run: `docker compose up --build`
Frontend: `http://localhost:4173`
Backend: `http://localhost:3000`

## API quick check

- `GET /api/health`
- `POST /api/scores/generate`