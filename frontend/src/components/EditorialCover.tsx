import type { ReactNode } from "react";
import { COPY } from "../copy";

interface EditorialCoverProps {
  children: ReactNode;
  bottomLabel?: string;
}

export function EditorialCover({ children, bottomLabel }: EditorialCoverProps) {
  return (
    <div className="cover">
      <header className="cover-top">
        <span className="wordmark cover-anim-1">EMOJIFY</span>
      </header>
      <main className="cover-hero">{children}</main>
      <footer className="cover-bottom cover-anim-4">
        <span>{bottomLabel ?? COPY.cover.footer}</span>
      </footer>
    </div>
  );
}
