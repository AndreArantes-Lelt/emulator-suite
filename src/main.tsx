import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot, type Root } from "react-dom/client";
import { AppProvider } from "./context/appContext";
import { NotificationProvider } from "./context/notificationContext";
import Home from "./routes/Home";
import NotFound from "./routes/NotFound";
import "./styles/main.scss";

declare global {
  interface Window {
    reactRoot?: Root;
  }
}

function App() {
  return (
    <BrowserRouter basename="/emulator-suite">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root")!;

if (!window.reactRoot) {
  window.reactRoot = createRoot(container);
}

window.reactRoot.render(
  <AppProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AppProvider>,
);
