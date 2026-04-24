interface LoginScreenProps {
  error: string | null;
  onLogin: () => void;
}

export function LoginScreen({ error, onLogin }: LoginScreenProps) {
  return (
    <div className="app">
      <main className="center">
        <div className="login-icon">🎵</div>
        <h1>Emojify</h1>
        <p className="subtitle">Turn your Spotify listening history into emotions and emojis.</p>
        {error && <p className="error">{error}</p>}
        <button type="button" className="btn primary big" onClick={onLogin}>
          Connect Spotify
        </button>
      </main>
    </div>
  );
}
