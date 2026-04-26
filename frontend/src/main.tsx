import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { PrivacyPolicy } from "./components";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

const isPrivacy = window.location.pathname.replace(/\/$/, "") === "/privacy";

createRoot(root).render(
  <StrictMode>
    {isPrivacy ? <PrivacyPolicy /> : <App />}
  </StrictMode>
);
