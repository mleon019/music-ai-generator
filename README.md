# TFG music-ai-generator

## Backend (I1)

1. Copy `backend/.env.example` to `backend/.env` and set `GROQ_API_KEY`

## Docker (backend only)

Run: `docker compose up --build`
Start server: `npm run dev`

## API quick check

- `GET /api/health`
- `POST /api/scores/generate`