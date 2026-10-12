import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const normalizeSecretPath = (path: string) => {
  const trimmedPath = path.trim();
  if (!trimmedPath) return "/ahmed_dashboard";

  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
};

export const SECRET_ADMIN_PATH = normalizeSecretPath(import.meta.env.VITE_ADMIN_DASHBOARD_PATH ?? "ahmed_dashboard");

export function useSecretHotkey() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isSecretCombo = event.ctrlKey && event.shiftKey && event.altKey && event.key.toLowerCase() === "u";

      if (!isSecretCombo) return;

      event.preventDefault();
      navigate(SECRET_ADMIN_PATH);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
