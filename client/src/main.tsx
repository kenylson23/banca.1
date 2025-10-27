import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, initPWAInstallPrompt } from "./registerServiceWorker";

createRoot(document.getElementById("root")!).render(<App />);

if (import.meta.env.PROD) {
  registerServiceWorker();
  initPWAInstallPrompt();
}
