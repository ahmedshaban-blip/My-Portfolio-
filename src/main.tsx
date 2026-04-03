import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AnimationProvider } from "@/context/AnimationContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AnimationProvider>
    <App />
  </AnimationProvider>
);
