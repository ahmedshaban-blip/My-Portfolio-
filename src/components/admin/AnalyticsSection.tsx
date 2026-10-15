import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, Eye, FileDown, MousePointerClick, Timer, Trash2, Users } from "lucide-react";
import { ADMIN_PIN_SESSION_KEY } from "@/components/admin/AdminAuthGuard";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { areaPaths, formatDuration } from "@/lib/analytics";
import { ANALYTICS_CONFIG } from "@/lib/analytics-config";
import { isOwnerDevice, setOwnerDevice } from "@/hooks/use-visit-tracker";
import { useVisitsAnalytics, type CustomRange, type RangeKey } from "@/hooks/use-visits-analytics";
import { cn } from "@/lib/utils";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7", label: "7 days" },
  { key: "14", label: "14 days" },
  { key: "30", label: "30 days" },
  { key: "all", label: "All" },
];

const rangeTitle = (range: RangeKey) => {
  if (range === "all") return "all time";
  if (range === "custom") return "custom range";
  return `last ${range} days`;
};

function Donut({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 48;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-32 w-32 shrink-0" role="img" aria-label="Traffic sources">
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="16" className="stroke-muted" />
        {slices.map((s) => {
          const len = (s.value / total) * C;
          const el = (
            <circle
              key={s.label}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(len - 3, 1)} ${C}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 60 60)"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-2 text-sm font-semibold">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
            {s.label}
            <span className="num text-muted-foreground">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalyticsSection() {
  const [range, setRange] = useState<RangeKey>("14");
  const [custom, setCustom] = useState<CustomRange>({ from: "", to: "" });
  const customValid = Boolean(custom.from && custom.to && custom.from <= custom.to);
  const { data, isPending, isError } = useVisitsAnalytics(range, customValid ? custom : undefined);
  // Bots are tracked apart (see the "bot hits filtered" chip) — the feed is humans only.
  const feed = (data?.feed ?? []).filter((item) => !item.bot);
  const [ownerMarked, setOwnerMarked] = useState(isOwnerDevice);
  const queryClient = useQueryClient();
  const [resetScope, setResetScope] = useState<"visits" | "cv" | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const handleReset = async (scope: "visits" | "cv") => {
    if (resetScope !== scope) {
      setResetScope(scope);
      setResetMsg("");
      return;
    }
    setResetBusy(true);
    try {
      const pin = sessionStorage.getItem(ADMIN_PIN_SESSION_KEY) ?? "";
      const res = await fetch("/api/visit-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${pin}` },
        body: JSON.stringify({ scope }),
      });
      const json = (await res.json()) as { ok?: boolean; deleted?: number; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Reset failed.");
      setResetMsg(`Cleared ${json.deleted ?? 0} keys — starting fresh.`);
      await queryClient.invalidateQueries({ queryKey: ["visits-analytics"] });
    } catch (error) {
      setResetMsg(error instanceof Error ? error.message : "Reset failed.");
    } finally {
      setResetBusy(false);
      setResetScope(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Live strip (B) ─────────────────────────────── */}
      <div className="flex flex-col gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
            {isPending ? "Connecting to analytics…" : (
              <>
                <span>
                  <span className="num font-extrabold text-emerald-600 dark:text-emerald-300">{data?.liveNow}</span>{" "}
                  visitors online now ·{" "}
                  <span className="num font-extrabold">{data?.today.toLocaleString()}</span> visits today
                </span>
                {(data?.owner.today ?? 0) > 0 && (
                  <span className="num rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    👤 you: {data?.owner.today} excluded
                  </span>
                )}
                {(data?.botsToday ?? 0) > 0 && (
                  <span className="num rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground" title="Crawlers and speed-test tools — excluded from visitor stats">
                    🤖 {data?.botsToday} bot hits filtered
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 rounded-full px-3 text-xs"
            title={ownerMarked ? "This browser's visits are counted as yours, apart from visitors." : "Mark this browser as yours so your visits don't pollute visitor stats."}
            onClick={() => {
              const next = !ownerMarked;
              setOwnerDevice(next);
              setOwnerMarked(next);
            }}
          >
            {ownerMarked ? "👤 This device is you ✓" : "Mark this device as me"}
          </Button>
          <Badge variant="outline" className="shrink-0 rounded-full">
            {data?.source === "live" ? "● Live data" : "○ No data yet"}
          </Badge>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-muted/70 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors",
                  range === r.key ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
            <DateRangePicker
              value={custom}
              active={range === "custom" && customValid}
              onApply={(next) => {
                setCustom(next);
                setRange("custom");
              }}
              onClear={() => {
                setCustom({ from: "", to: "" });
                if (range === "custom") setRange("14");
              }}
            />
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : isError || !data ? (
        <Card className="modern-card"><CardContent className="py-8 text-center text-sm text-muted-foreground">Could not load analytics.</CardContent></Card>
      ) : (
        <>
          {data.source === "live" && !data.hasData && (
            <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Tracking is active — real numbers will appear here with the first visits.
              Until then the layout below shows zeros.
            </p>
          )}
          {/* ── KPI cards (A) ──────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Eye, label: "Total visits", value: data.last30.toLocaleString(), delta: data.source === "live" ? data.rangeLabel : "—", up: true },
              { icon: Users, label: "Unique visitors", value: data.unique30.toLocaleString(), delta: data.source === "live" ? "HyperLogLog estimate" : "—", up: true },
              { icon: Timer, label: "Avg. session", value: data.source === "live" ? "—" : "—", delta: data.source === "live" ? "Ships in v2" : "—", up: false },
              { icon: MousePointerClick, label: "Bounce rate", value: "—", delta: data.source === "live" ? "Ships in v2" : "—", up: true },
            ].map((k) => (
              <Card key={k.label} className="modern-card glass-effect overflow-hidden">
                <CardContent className="space-y-1 p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <k.icon className="h-3.5 w-3.5 text-primary" /> {k.label}
                  </div>
                  <div className="num text-3xl font-extrabold tracking-tight">{k.value}</div>
                  <div className={cn("text-xs font-bold", k.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>{k.delta}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Trend (A) + Sources (A) ────────────────── */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="modern-card glass-effect lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">Visits — {rangeTitle(range)}</CardTitle>
                    <CardDescription className="num">{data.rangeLabel} · Peak: {data.peakDay}</CardDescription>
                  </div>
                  <Badge variant="outline" className="num rounded-full">{data.daily.reduce((s, d) => s + d.visits, 0).toLocaleString()} total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const { line, area, peak } = areaPaths(data.daily.map((d) => d.visits), 560, 170);
                  return (
                    <svg viewBox="0 0 560 170" className="h-44 w-full" role="img" aria-label="Visits trend">
                      <defs>
                        <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[0.25, 0.5, 0.75].map((f) => (
                        <line key={f} x1="0" x2="560" y1={170 * f} y2={170 * f} className="stroke-border" strokeDasharray="4 5" />
                      ))}
                      <path d={area} fill="url(#visitsFill)" />
                      <path d={line} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                      <circle cx={peak.x} cy={peak.y} r="5" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
                    </svg>
                  );
                })()}
                <div className="flex justify-between px-1 text-[11px] font-bold text-muted-foreground">
                  <span>{data.daily[0]?.label}</span>
                  <span>{data.daily[Math.floor(data.daily.length / 2)]?.label}</span>
                  <span>Today</span>
                </div>
              </CardContent>
            </Card>

            <Card className="modern-card glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Traffic sources</CardTitle>
                <CardDescription>Where visitors come from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.sources.length > 0 ? (
                  <Donut slices={data.sources} />
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">No source data yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Hourly (B) + Live feed (B) + Devices (B) + Top pages (A) ── */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="modern-card glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-4 w-4 text-primary" /> Activity by hour</CardTitle>
                <CardDescription>Today · peak 8–10 PM</CardDescription>
              </CardHeader>
              <CardContent>
                {data.hourly.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">No hourly data yet.</p>
                ) : (
                <>
                <div className="flex h-36 items-end gap-1.5" dir="ltr">
                  {(() => {
                    const max = Math.max(...data.hourly.map((h) => h.value), 1);
                    return data.hourly.map((h) => (
                      <div key={h.hour} className="flex flex-1 flex-col items-center gap-1" title={`${h.hour}: ${h.value}`}>
                        <div
                          className={cn("w-full rounded-t-md", h.value === max ? "bg-amber-400" : "bg-primary/70")}
                          style={{ height: `${Math.max((h.value / max) * 100, 6)}%`, minHeight: 6 }}
                        />
                      </div>
                    ));
                  })()}
                </div>
                <div className="mt-1 flex justify-between text-[11px] font-bold text-muted-foreground" dir="ltr">
                  <span>12a</span><span>6a</span><span>12p</span><span>9p ●</span>
                </div>
                </>
                )}
                <div className="mt-4 space-y-2.5">
                  {data.devices.map((d) => (
                    <div key={d.label}>
                      <div className="mb-1 flex justify-between text-xs font-bold"><span>{d.label}</span><span className="num">{d.value}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-2 rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                      </div>
                    </div>
                  ))}
                  <p className="pt-1 text-[11px] font-semibold text-muted-foreground">
                    {data.browsers.length > 0
                      ? data.browsers.map((b) => `${b.label} ${b.value}%`).join(" · ")
                      : "No browser data yet."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="modern-card glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">⚡ Live feed</CardTitle>
                <CardDescription>Latest visits as they happen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {feed.length > 0 ? (
                <div className="space-y-2 overflow-y-auto pe-1" style={{ maxHeight: ANALYTICS_CONFIG.feedMaxHeightPx }}>
                {feed.map((f, i) => (
                  <div key={`${f.place}-${i}`} className={cn("flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm", f.you ? "border border-amber-500/40 bg-amber-500/10" : "bg-muted/50")}>
                    <span className="truncate font-semibold">
                      {f.you && <span className="me-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">YOU</span>}
                      {f.place} · <span className="num font-mono text-xs">{f.path}</span>
                    </span>
                    <span className="num shrink-0 text-xs text-muted-foreground">{f.when}</span>
                  </div>
                ))}
                </div>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">No visits recorded yet.</p>
                )}
                {data.source === "empty" && (
                <p className="rounded-xl border border-border/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  Tracking isn't storing data — check Upstash Redis env vars and redeploy.
                </p>
                )}
              </CardContent>
            </Card>

            <Card className="modern-card glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">📄 Top pages</CardTitle>
                <CardDescription>Most visited routes</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2 text-start font-bold">Page</th>
                      <th className="px-2 py-2 text-end font-bold">Visits</th>
                      <th className="px-4 py-2 text-end font-bold">Bounce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPages.length > 0 ? data.topPages.map((p) => (
                      <tr key={p.path} className="border-t border-border/50">
                        <td className="px-4 py-2.5">
                          <span className="num block font-mono text-xs font-bold">{p.path}</span>
                          <span className="num text-[11px] text-muted-foreground">{p.avgSeconds > 0 ? `${formatDuration(p.avgSeconds)} avg` : "—"}</span>
                        </td>
                        <td className="num px-2 py-2.5 text-end font-extrabold">{p.visits.toLocaleString()}</td>
                        <td className="num px-4 py-2.5 text-end text-muted-foreground">{p.bounce > 0 ? `${p.bounce}%` : "—"}</td>
                      </tr>
                    )) : (
                      <tr className="border-t border-border/50">
                        <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted-foreground">No page data yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          {/* ── CV downloads + Top countries ────────── */}
          <div className="grid gap-4 lg:grid-cols-2">
          <Card className="modern-card glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg"><FileDown className="h-4 w-4 text-primary" /> CV downloads</CardTitle>
              <CardDescription>Who downloaded which CV · last 14 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.cv.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No downloads recorded yet.</p>
              )}
              {data.cv.map((c) => {
                const max = Math.max(...c.daily.map((d) => d.value), 1);
                return (
                  <div key={c.track} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-extrabold capitalize">{c.track} CV</span>
                      <span className="num text-2xl font-extrabold">{c.total.toLocaleString()}</span>
                    </div>
                    <div className="num text-xs text-muted-foreground">{c.unique.toLocaleString()} unique downloaders</div>
                    <div className="mt-2 flex h-10 items-end gap-1" dir="ltr">
                      {c.daily.map((d, i) => (
                        <div
                          key={`${d.date}-${i}`}
                          title={`${d.date}: ${d.value}`}
                          className={cn("flex-1 rounded-sm", c.track === "flutter" ? "bg-primary/80" : "bg-amber-500/80")}
                          style={{ height: `${Math.max((d.value / max) * 100, 5)}%`, minHeight: 3 }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {data.cv.length === 2 && data.cv[0].total + data.cv[1].total > 0 && (
                <p className="text-xs font-semibold text-muted-foreground">
                  {(() => {
                    const [a, b] = data.cv;
                    const lead = a.total >= b.total ? a : b;
                    const share = Math.round((lead.total / (a.total + b.total)) * 100);
                    return `💡 ${lead.track} CV takes ${share}% of downloads — order it first on the site.`;
                  })()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="modern-card glass-effect">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">🌍 Top countries</CardTitle>
              <CardDescription>Where visitors come from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.countries.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No country data yet.</p>
              )}
              {(() => {
                const max = Math.max(...data.countries.map((c) => c.visits), 1);
                return data.countries.map((c) => (
                  <div key={c.code}>
                    <div className="mb-1 flex justify-between text-sm font-bold">
                      <span className="num">{c.code}</span>
                      <span className="num">{c.visits.toLocaleString()}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary/80" style={{ width: `${Math.max((c.visits / max) * 100, 4)}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
          </div>

          {/* ── Danger zone ──────────────────────────── */}
          <Card className="modern-card border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-destructive"><Trash2 className="h-4 w-4" /> Danger zone</CardTitle>
              <CardDescription>Wipe stored analytics and start fresh. This cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={resetScope === "visits" ? "destructive" : "outline"}
                size="sm"
                disabled={resetBusy}
                onClick={() => void handleReset("visits")}
                className="rounded-full"
              >
                {resetScope === "visits" ? "Click again to confirm visits reset" : "Reset visits history"}
              </Button>
              <Button
                type="button"
                variant={resetScope === "cv" ? "destructive" : "outline"}
                size="sm"
                disabled={resetBusy}
                onClick={() => void handleReset("cv")}
                className="rounded-full"
              >
                {resetScope === "cv" ? "Click again to confirm CV reset" : "Reset CV downloads"}
              </Button>
              {resetBusy && <span className="text-xs text-muted-foreground">Clearing…</span>}
              {resetMsg && <span className="text-xs font-semibold">{resetMsg}</span>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
