import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AnimationProvider } from "@/context/AnimationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AnimationProvider>
      <App />
    </AnimationProvider>
  </ErrorBoundary>
);
