/**
 * Spotify PKCE auth and top tracks.
 * Set VITE_SPOTIFY_CLIENT_ID in .env (from Spotify Dashboard).
 */

import type { TimeRange } from "./types/spotify";
import type { SpotifyTopTracksResponse } from "./types/spotify";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const REDIRECT_URI =
  typeof window !== "undefined" ? `${window.location.origin}/` : "";

function getClientId(): string {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? "";
}

function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) result += chars[values[i]! % chars.length];
  return result;
}

function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function getAuthUrl(): Promise<string> {
  const clientId = getClientId();
  if (!clientId) throw new Error("Missing VITE_SPOTIFY_CLIENT_ID");
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);
  sessionStorage.setItem("spotify_code_verifier", codeVerifier);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: "user-top-read",
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

export function getStoredToken(): string | null {
  const token = sessionStorage.getItem("spotify_access_token");
  const expiry = sessionStorage.getItem("spotify_token_expiry");
  if (!token || !expiry) return null;
  if (Date.now() >= Number(expiry)) return null;
  return token;
}

export function storeToken(
  accessToken: string,
  expiresInSeconds: number = 3600
): void {
  sessionStorage.setItem("spotify_access_token", accessToken);
  sessionStorage.setItem(
    "spotify_token_expiry",
    String(Date.now() + expiresInSeconds * 1000)
  );
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const codeVerifier = sessionStorage.getItem("spotify_code_verifier");
  if (!codeVerifier) throw new Error("No code verifier");
  const clientId = getClientId();
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      code_verifier: codeVerifier,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Token exchange failed");
  }
  const data = (await res.json()) as TokenResponse;
  storeToken(data.access_token, data.expires_in);
  sessionStorage.removeItem("spotify_code_verifier");
  return data.access_token;
}

export function logout(): void {
  sessionStorage.removeItem("spotify_access_token");
  sessionStorage.removeItem("spotify_token_expiry");
  sessionStorage.removeItem("spotify_code_verifier");
}

export async function getTopTracks(
  timeRange: TimeRange,
  limit: number = 50
): Promise<SpotifyTopTracksResponse> {
  const token = getStoredToken();
  if (!token) throw new Error("Not logged in");
  const url = `${SPOTIFY_API_BASE}/me/top/tracks?time_range=${timeRange}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401)
      throw new Error("Session expired. Please log in again.");
    throw new Error(`Spotify error: ${res.status}`);
  }
  return res.json() as Promise<SpotifyTopTracksResponse>;
}
