import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { classifySource, detectBrowser, detectDevice } from "@/lib/analytics";
import { SECRET_ADMIN_PATH } from "@/hooks/use-secret-hotkey";
import { OWNER_DEVICE_KEY } from "@/components/admin/AdminAuthGuard";

const SESSION_KEY = "pf_session_id";
const SESSION_START_KEY = "pf_sess_start";
const SESSION_LAST_KEY = "pf_sess_last";
const SESSION_VIEWS_KEY = "pf_sess_views";
const SESSION_LANDING_KEY = "pf_sess_landing";
const PAGE_START_KEY = "pf_page_start";
const PAGE_PATH_KEY = "pf_page_path";

/**
 * A session counts as "engaged" (i.e. not a bounce) once it lasts this long or
 * reaches 2+ pages — the GA4 rule, so the dashboard's bounce rate is comparable.
 */
export const ENGAGED_SECONDS = 10;
/** Inactivity gap that starts a brand-new session. */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const adminPath = SECRET_ADMIN_PATH.replace(/\//g, "");

// sessionStorage helpers — never throw (private mode / blocked storage).
const read = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Non-fatal.
  }
};
const drop = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Non-fatal.
  }
};

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

/** Cumulative session snapshot — the server keeps the latest record per session. */
function flushEngagement() {
  try {
    const session = read(SESSION_KEY);
    const started = Number(read(SESSION_START_KEY) ?? "0");
    if (!session || !started) return;

    const views = Math.max(1, Number(read(SESSION_VIEWS_KEY) ?? "0") || 1);
    const now = Date.now();
    const pageStart = Number(read(PAGE_START_KEY) ?? "0") || started;
    const payload = JSON.stringify({
      type: "engagement",
      session,
      seconds: Math.round((now - started) / 1000),
      viewCount: views,
      landing: read(SESSION_LANDING_KEY) ?? "/",
      pagePath: read(PAGE_PATH_KEY) ?? "/",
      pageSeconds: Math.round((now - pageStart) / 1000),
      owner: isOwnerDevice(),
    });

    // sendBeacon survives page unloads; fetch(keepalive) is the fallback.
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/track-visit", blob)) return;
    void fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Tracking must never break the public site.
  }
}

/**
 * Fire-and-forget page-visit tracker. Sends one hit per route, plus a cumulative
 * engagement beacon (time on site, pages seen) when the visitor leaves a page or
 * the tab. Never tracks the admin dashboard itself.
 */
export function useVisitTracker() {
  const location = useLocation();
  const lastHit = useRef<{ path: string; at: number }>({ path: "", at: 0 });
  // Which public path is currently "open" — cleared while on the admin route so
  // background activity there never inflates public engagement numbers.
  const activePath = useRef("");

  // Flush the running session snapshot when the tab is hidden or closed.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flushEngagement();
    };
    const onPageHide = () => flushEngagement();

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  useEffect(() => {
    try {
      const path = location.pathname;
      const now = Date.now();

      // Leaving a tracked page: record the time spent before moving on.
      if (activePath.current && activePath.current !== path) flushEngagement();

      if (path.replace(/\//g, "") === adminPath) {
        activePath.current = "";
        return;
      }
      if (lastHit.current.path === path && now - lastHit.current.at < 30_000) return;
      lastHit.current = { path, at: now };
      activePath.current = path;

      // Start a fresh session after 30 minutes of inactivity (or on first hit).
      const last = Number(read(SESSION_LAST_KEY) ?? "0");
      if (!read(SESSION_START_KEY) || (last > 0 && now - last > SESSION_TIMEOUT_MS)) {
        drop(SESSION_KEY);
        write(SESSION_START_KEY, String(now));
        write(SESSION_VIEWS_KEY, "0");
        write(SESSION_LANDING_KEY, path);
      }
      write(SESSION_LAST_KEY, String(now));
      write(PAGE_START_KEY, String(now));
      write(PAGE_PATH_KEY, path);
      const views = Math.max(1, Number(read(SESSION_VIEWS_KEY) ?? "0") + 1);
      write(SESSION_VIEWS_KEY, String(views));

      const payload = {
        path,
        source: document.referrer ? classifySource(document.referrer) : "Direct",
        device: detectDevice(),
        browser: detectBrowser(),
        session: getSessionId(),
        owner: isOwnerDevice(),
        views,
        landing: read(SESSION_LANDING_KEY) ?? path,
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
