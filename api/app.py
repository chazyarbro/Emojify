"""
Flask API for lyrics emotion analysis and random quotes.
Uses Genius for lyrics and HuggingFace Inference API for emotion.
"""
import os
import random
import re
import time
from concurrent.futures import ThreadPoolExecutor

import nltk
import lyricsgenius as lg
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
CORS(app, origins=_cors_origins)

GENIUS_TOKEN = os.environ["GENIUS_TOKEN"]
HF_API_TOKEN = os.environ["HF_API_TOKEN"]
HF_MODEL_URL = "https://api-inference.huggingface.co/models/arpanghoshal/EmoRoBERTa"

MAX_SONGS = 25
FETCH_WORKERS = 5

# EmoRoBERTa labels we care about -> canonical emotion for response
EMOTION_MAP = {
    "joy": "joy",
    "sadness": "sadness",
    "grief": "sadness",
    "anger": "anger",
    "annoyance": "anger",
    "disgust": "anger",
    "love": "love",
    "admiration": "love",
    "caring": "love",
    "desire": "love",
    "fear": "fear",
    "nervousness": "fear",
    "surprise": "surprise",
    "neutral": "neutral",
    "excitement": "excitement",
    "amusement": "excitement",
    "disappointment": "disappointment",
    "optimism": "optimism",
    "approval": "optimism",
    "gratitude": "optimism",
    "relief": "optimism",
    "disapproval": "disappointment",
    "remorse": "sadness",
    "embarrassment": "sadness",
    "pride": "joy",
    "curiosity": "surprise",
    "realization": "neutral",
    "confusion": "neutral",
}

CANONICAL_EMOTIONS = [
    "joy", "sadness", "anger", "love", "fear", "surprise",
    "neutral", "excitement", "disappointment", "optimism",
]


genius = lg.Genius(
    GENIUS_TOKEN,
    verbose=False,
    remove_section_headers=True,
    retries=3,
)
genius._session.headers["User-Agent"] = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


def classify_emotions_batch(texts):
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    for attempt in range(2):
        resp = requests.post(
            HF_MODEL_URL,
            headers=headers,
            json={"inputs": texts},
            timeout=60,
        )
        if resp.status_code == 503:
            # Model is still loading on HF side — wait and retry once
            time.sleep(25)
            continue
        resp.raise_for_status()
        break
    raw = resp.json()
    # HF API returns [[{label, score}, ...], ...] sorted by score desc
    # Take the top prediction per input
    return [item[0] if isinstance(item, list) else item for item in raw]


def fetch_lyrics(song_title, artist=None):
    query = f"{song_title} {artist}" if artist else song_title
    try:
        results = genius.search_songs(query)
    except Exception:
        return None
    for hit in (results or {}).get("hits", []):
        if hit.get("type") != "song":
            continue
        url = hit.get("result", {}).get("url")
        if not url:
            continue
        try:
            return genius.lyrics(song_url=url)
        except Exception:
            continue
    if artist:
        return fetch_lyrics(song_title)
    return None


def lyrics_to_clean_text(lyrics):
    if not lyrics:
        return ""
    text = re.sub(r"[\(\[].*?[\)\]]", "", lyrics)
    if "Lyrics" in text:
        text = text[text.find("Lyrics") + 6:]
    return text.strip()


def remove_see_live_ad(s):
    return re.sub(r"See .+ like", "", s, flags=re.IGNORECASE)


def until_embed(s):
    return re.sub(r"\d{1,3}Embed|Embed\d{1,3}", "", s, flags=re.IGNORECASE)


def _fetch_and_clean(args):
    song_title, artist = args
    try:
        raw = fetch_lyrics(song_title, artist)
        return lyrics_to_clean_text(raw) if raw else None
    except Exception:
        return None


def _fetch_quote(args):
    song_title, artist = args
    try:
        raw = fetch_lyrics(song_title, artist)
        if not raw:
            return None
        text = until_embed(remove_see_live_ad(lyrics_to_clean_text(raw)))
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        return random.choice(lines) + " - " + artist if lines else None
    except Exception:
        return None


@app.route("/lyrics", methods=["POST"])
def lyrics():
    songs_dict = request.get_json()
    if not songs_dict:
        return jsonify({"error": "Invalid JSON body"}), 400

    song_pairs = [
        (title, artist)
        for artist, songs in songs_dict.items()
        for title in songs
    ][:MAX_SONGS]

    with ThreadPoolExecutor(max_workers=FETCH_WORKERS) as executor:
        cleaned = list(executor.map(_fetch_and_clean, song_pairs))

    texts = [t[:512] for t in cleaned if t]
    if not texts:
        return jsonify([[e, 0.0] for e in CANONICAL_EMOTIONS])

    predictions = classify_emotions_batch(texts)

    emotion_totals = {e: 0.0 for e in CANONICAL_EMOTIONS}
    for pred in predictions:
        label = pred["label"].lower()
        score = round(pred["score"], 3)
        canonical = EMOTION_MAP.get(label, "neutral")
        if canonical in emotion_totals:
            emotion_totals[canonical] += score

    emotion_totals["neutral"] = 0
    sorted_emotions = sorted(emotion_totals.items(), key=lambda x: x[1], reverse=True)
    return jsonify(sorted_emotions)


@app.route("/quote", methods=["POST"])
def quote():
    songs_dict = request.get_json()
    if not songs_dict:
        return jsonify([])

    pairs = [
        (songs[0], artist)
        for artist, songs in list(songs_dict.items())[:5]
        if songs
    ]

    with ThreadPoolExecutor(max_workers=FETCH_WORKERS) as executor:
        results = list(executor.map(_fetch_quote, pairs))

    return jsonify([r for r in results if r])


if __name__ == "__main__":
    nltk.download("omw-1.4", quiet=True)
    app.run(debug=True, port=5000)
