# TFG music-ai-generator

## Backend (I1)

1. Copy `backend/.env.example` to `backend/.env` and set `GROQ_API_KEY`

### Testing commands

Locate in backend directory: `cd backend`
Install dependencies in local: `npm install`
Run the db container: `docker compose up -d db`
Run all tests: `npm test`
Stop the db: `docker compose stop db`

## Frontend (I2)

1. Copy `frontend/.env.example` to `frontend/.env`

## Docker (full stack)

Run: `docker compose up --build`
Frontend: `http://localhost:4173`
Backend: `http://localhost:3000`

If data has been damaged, run `docker compose down -v db` and set up again.