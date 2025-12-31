import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, initPWAInstallPrompt } from "./registerServiceWorker";
import { checkForUpdates } from "./utils/cache-buster";

createRoot(document.getElementById("root")!).render(<App />);

if (import.meta.env.PROD) {
  registerServiceWorker();
  initPWAInstallPrompt();
}

// Cache busting não é necessário em desenvolvimento
// O Vite HMR já cuida das atualizações automaticamente
if (import.meta.env.DEV) {
}
