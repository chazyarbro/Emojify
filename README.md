# Emojify MVP

A small web app that turns your Spotify top tracks into emotion emojis using lyrics analysis.

## What you need

1. **Spotify app** – [Dashboard](https://developer.spotify.com/dashboard): create an app, set **Redirect URI** to `http://localhost:5173/`.
2. **Flask API** – runs at `http://localhost:5000` (lyrics + quote endpoints).
3. **Genius token** – for lyrics (already in `api/app.py`; move to env if you prefer).

## Setup

### 1. Frontend (React + Vite)

```bash
cd frontend
cp .env.example .env
# Edit .env and set VITE_SPOTIFY_CLIENT_ID to your Spotify app Client ID
npm install
npm run dev
```

App runs at **http://localhost:5173**.

### 2. Backend (Flask)

```bash
cd api
# Optional: create a venv first
pip install -r requirements.txt
python app.py
```

API runs at **http://localhost:5000**.

## Flow

1. Log in with Spotify (PKCE).
2. Choose time range: Last Month / Last 6 Months / All Time.
3. Click **Generate Emojis**.
4. App fetches your top tracks from Spotify, sends them to the Flask API for lyrics emotion analysis.
5. While waiting, random lyric quotes from the `/quote` endpoint are shown.
6. Results show top emotions as emojis with labels and scores.

## API (Flask)

- **POST /lyrics**  
  Body: `{ "Artist Name": ["Song Title", ... ] }`  
  Response: `[ ["joy", 3.24], ["sadness", 2.11], ... ]`

- **POST /quote**  
  Same body.  
  Response: `[ "lyric line - artist", ... ]`

## Project layout

- `frontend/` – Vite + React app (Spotify OAuth, UI, calls to Flask).
- `api/` – Flask app (Genius + EmoRoBERTa for lyrics and emotions).
