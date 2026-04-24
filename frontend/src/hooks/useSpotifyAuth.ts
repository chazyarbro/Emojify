import { useState, useEffect, useCallback } from "react";
import {
  getAuthUrl,
  getStoredToken,
  exchangeCodeForToken,
  logout as spotifyLogout,
} from "../spotify";

export interface UseSpotifyAuthResult {
  token: string | null;
  error: string | null;
  clearError: () => void;
  handleLogin: () => void;
  handleLogout: () => void;
}

export function useSpotifyAuth(): UseSpotifyAuthResult {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      exchangeCodeForToken(code)
        .then((t) => setToken(t))
        .catch((e) => setError((e as Error).message));
      return;
    }
    const t = getStoredToken();
    if (t) setToken(t);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const handleLogin = useCallback(() => {
    setError(null);
    getAuthUrl()
      .then((url) => (window.location.href = url))
      .catch((e) => setError((e as Error).message));
  }, []);

  const handleLogout = useCallback(() => {
    spotifyLogout();
    setToken(null);
    setError(null);
  }, []);

  return { token, error, clearError, handleLogin, handleLogout };
}
