interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <header className="header">
      <h1>Emojify</h1>
      <button type="button" className="btn secondary" onClick={onLogout}>
        Log out
      </button>
    </header>
  );
}
