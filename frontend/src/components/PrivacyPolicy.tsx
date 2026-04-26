import { COPY } from "../copy";

export function PrivacyPolicy() {
  const { title, effective, back, sections } = COPY.privacy;

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <a href="/" className="privacy-back">{back}</a>
        <span className="wordmark">EMOJIFY</span>
      </header>
      <main className="privacy-main">
        <p className="privacy-effective">{effective}</p>
        <h1 className="privacy-title">{title}</h1>
        {sections.map((section) => (
          <section className="privacy-section" key={section.heading}>
            <h2 className="privacy-heading">{section.heading}</h2>
            {section.paragraphs.map((p, i) => (
              <p className="privacy-paragraph" key={i}>{p}</p>
            ))}
            {"links" in section && section.links && (
              <ul className="privacy-links">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noreferrer noopener">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
      <footer className="privacy-footer">
        <span>EMOJIFY · PRIVACY</span>
        <a href="/" className="privacy-back">{back}</a>
      </footer>
    </div>
  );
}
