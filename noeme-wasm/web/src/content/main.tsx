import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "./views/App.tsx";

const container = document.createElement("div");
container.id = "explainer";

document.body.appendChild(container);
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
