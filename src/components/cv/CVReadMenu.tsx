import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Download, ExternalLink, FileText, Globe, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CV_CONFIG, type CVTrack } from "@/config/cv";
import { CV_TRACKS } from "@/lib/cv-view";
import { cn, downloadCV } from "@/lib/utils";
import { openCV } from "@/lib/cv-link";
import { useAnimationContext } from "@/hooks/useAnimationContext";

type CVReadMenuProps = {
  /** Trigger text. Defaults to "CV" to keep the surrounding row uncluttered. */
  label?: string;
  /** Shows the two mini track chips on the trigger (hero / mobile menu). */
  chips?: boolean;
  className?: string;
  /** Extra callback after any action fires (e.g. close the mobile menu). */
  onAction?: () => void;
  align?: "start" | "end";
};

/** Per-track section identity inside the menu, and the trigger chips. */
const TRACK_META: Record<CVTrack, { icon: typeof Globe; roleHint: string; chipTint: string; label: string }> = {
  flutter: {
    icon: Smartphone,
    roleHint: "Mobile",
    chipTint: "bg-primary/10 text-primary border-primary/25",
    label: "Flutter",
  },
  frontend: {
    icon: Globe,
    roleHint: "Web",
    chipTint: "bg-accent/10 text-accent border-accent/25",
    label: "Frontend",
  },
};

/**
 * Single "CV" entry point: one dropdown that holds BOTH actions for BOTH
 * tracks — "Read in a new tab" (inline PDF, native viewer) and "Download".
 * Developers/recruiters pick a track, then pick what to do with it, so the
 * surrounding layout stays to one pill instead of three buttons.
 *
 * PERFORMANCE: intentionally hand-rolled instead of Radix `DropdownMenu`. The
 * Radix menu weighs ~85 kB raw once inlined, which would regress the entry
 * bundle shared with the home route. Keyboard and screen-reader semantics
 * below mirror `role="menu"`: Escape closes and refocuses the trigger,
 * ArrowUp/Down cycle items, click-away dismisses.
 */
export function CVReadMenu({ label = "CV", chips = false, className, onAction, align = "end" }: CVReadMenuProps) {
  const { reducedMotion } = useAnimationContext();
  const [open, setOpen] = useState(false);
  // Flips the panel above the trigger when there is no room below — otherwise
  // menus near the viewport bottom appear cut off even though nothing clips
  // them in CSS.
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const close = useCallback((focusTrigger = false) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close(true);
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        const next =
          event.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
        items[next]?.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  // After the panel mounts, flip it above the trigger when the viewport has
  // more room above than below (measured, so it works at any panel size).
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    if (below < panel.offsetHeight + 12 && above > below) setDropUp(true);
  }, [open]);

  // Reset so the next open re-measures instead of inheriting the last direction.
  useEffect(() => {
    if (!open) setDropUp(false);
  }, [open]);

  const handleAction = (track: CVTrack, action: "read" | "download") => {
    if (action === "read") openCV(track);
    else downloadCV(track);
    close();
    onAction?.();
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        className={cn(
          "w-full rounded-full border-border/60 bg-background text-foreground",
          // The outline variant's default hover fill (orange) swallows the
          // accent-tinted Frontend chip and muddies the Flutter one — hover on
          // a quiet neutral fill instead, and keep it while the menu is open.
          "hover:bg-secondary/60 hover:text-foreground",
          open && "border-primary/40 bg-secondary/60 text-foreground",
          className
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${label} — read or download the Flutter or Frontend CV`}
        onClick={() => setOpen((value) => !value)}
      >
        <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
        {label}
        {chips && (
          <span aria-hidden="true" className="ml-1.5 inline-flex items-center gap-1">
            {CV_TRACKS.map((track) => (
              <span
                key={track}
                className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-bold", TRACK_META[track].chipTint)}
              >
                {TRACK_META[track].label}
              </span>
            ))}
          </span>
        )}
        <ChevronDown
          className={cn("ml-1.5 h-3.5 w-3.5 opacity-70 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label="CV options — choose a track, then read or download"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute z-[130] w-72 overflow-hidden rounded-2xl border border-border/60 bg-background p-1.5 shadow-2xl",
              dropUp ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]",
              align === "end" ? "right-0" : "left-0"
            )}
          >
            {CV_TRACKS.map((track, groupIndex) => {
              const meta = TRACK_META[track];
              return (
              <div
                key={track}
                role="group"
                aria-label={CV_CONFIG[track].label}
                className={cn(groupIndex > 0 && "mt-1.5 border-t border-border/50 pt-1")}
              >
                {/* Section header: an icon chip + role hint so the two CV
                    sections are recognisable at a glance, not two look-alike
                    muted labels. */}
                <div
                  aria-hidden="true"
                  className="flex items-center gap-2 px-2.5 pb-1.5 pt-1.5"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                      meta.chipTint
                    )}
                  >
                    <meta.icon className="h-3 w-3" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    {CV_CONFIG[track].label}
                  </span>
                  <span
                    className={cn(
                      "ml-auto rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                      meta.chipTint
                    )}
                  >
                    {meta.roleHint}
                  </span>
                </div>
                <button
                  ref={(node) => {
                    itemRefs.current[groupIndex * 2] = node;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => handleAction(track, "read")}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm text-foreground">
                    Read in a new tab
                    <span className="ml-1.5 text-xs text-muted-foreground">no download</span>
                  </span>
                </button>
                <button
                  ref={(node) => {
                    itemRefs.current[groupIndex * 2 + 1] = node;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => handleAction(track, "download")}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none"
                >
                  <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm text-foreground">Download PDF</span>
                </button>
              </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
