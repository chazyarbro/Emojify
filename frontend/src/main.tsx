import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ShareView } from "./components";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

// Detect share route synchronously before mounting — no router needed.
// Unauthenticated users can view shared diagnoses without any auth state.
const shareParam = new URLSearchParams(window.location.search).get("d");
const isShareRoute = window.location.pathname.startsWith("/share") && !!shareParam;

createRoot(root).render(
  <StrictMode>
    {isShareRoute ? <ShareView encoded={shareParam!} /> : <App />}
  </StrictMode>
);
