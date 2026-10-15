import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { classifySource, detectBrowser, detectDevice } from "@/lib/analytics";
import { SECRET_ADMIN_PATH } from "@/hooks/use-secret-hotkey";
import { OWNER_DEVICE_KEY } from "@/components/admin/AdminAuthGuard";

const SESSION_KEY = "pf_session_id";
const adminPath = SECRET_ADMIN_PATH.replace(/\//g, "");

export const isOwnerDevice = () => {
  try {
    return localStorage.getItem(OWNER_DEVICE_KEY) === "1";
  } catch {
    return false;
  }
};

export const setOwnerDevice = (owner: boolean) => {
  try {
    if (owner) localStorage.setItem(OWNER_DEVICE_KEY, "1");
    else localStorage.removeItem(OWNER_DEVICE_KEY);
  } catch {
    // Non-fatal.
  }
};

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Fire-and-forget page-visit tracker. Sends one hit per route to
 * `/api/track-visit` (no-op until Upstash Redis is configured).
 * Never tracks the admin dashboard itself.
 */
export function useVisitTracker() {
  const location = useLocation();
  const lastHit = useRef<{ path: string; at: number }>({ path: "", at: 0 });

  useEffect(() => {
    try {
      const path = location.pathname;
      if (path.replace(/\//g, "") === adminPath) return;
      if (lastHit.current.path === path && Date.now() - lastHit.current.at < 30_000) return;
      lastHit.current = { path, at: Date.now() };

      const payload = {
        path,
        source: document.referrer ? classifySource(document.referrer) : "Direct",
        device: detectDevice(),
        browser: detectBrowser(),
        session: getSessionId(),
        owner: isOwnerDevice(),
      };

      void fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      // Tracking must never break the public site.
    }
  }, [location.pathname]);
}
