import { useState } from "react";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CustomRange } from "@/hooks/use-visits-analytics";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  /** Applied range (ISO "YYYY-MM-DD"), owned by the parent. */
  value: CustomRange;
  /** Whether this range is the one currently driving the analytics query. */
  active: boolean;
  onApply: (range: CustomRange) => void;
  onClear: () => void;
};

const pad = (value: number) => String(value).padStart(2, "0");

/** "2026-10-15" → local Date (never UTC-shifted, so the picked day stays the picked day). */
const fromISO = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

const toISO = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const daysAgo = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
};

const rangeOf = (from: Date, to: Date): CustomRange => ({ from: toISO(from), to: toISO(to) });

/** Weekday-free short label: "Oct 15" this year, "Oct 15, 2025" otherwise. */
const shortDay = (iso: string) => {
  const date = fromISO(iso);
  if (!date) return iso;
  const label = `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`;
  return date.getFullYear() === new Date().getFullYear() ? label : `${label}, ${date.getFullYear()}`;
};

const spanInDays = (range: CustomRange) =>
  Math.round((Date.parse(range.to) - Date.parse(range.from)) / 86_400_000) + 1;

type Preset = { label: string; build: () => CustomRange };

const PRESETS: Preset[] = [
  { label: "Last 7 days", build: () => rangeOf(daysAgo(-6), daysAgo(0)) },
  { label: "Last 14 days", build: () => rangeOf(daysAgo(-13), daysAgo(0)) },
  { label: "Last 30 days", build: () => rangeOf(daysAgo(-29), daysAgo(0)) },
  {
    label: "This month",
    build: () => {
      const today = new Date();
      return rangeOf(new Date(today.getFullYear(), today.getMonth(), 1), today);
    },
  },
  {
    label: "Last month",
    build: () => {
      const today = new Date();
      const previous = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return rangeOf(previous, new Date(today.getFullYear(), today.getMonth(), 0));
    },
  },
  {
    label: "This year",
    build: () => rangeOf(new Date(new Date().getFullYear(), 0, 1), daysAgo(0)),
  },
];

export function DateRangePicker({ value, active, onApply, onClear }: DateRangePickerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CustomRange>(value);

  const today = new Date();
  const valid = Boolean(draft.from && draft.to && draft.from <= draft.to);
  const appliedLabel = active && value.from && value.to
    ? `${shortDay(value.from)} – ${shortDay(value.to)}`
    : "Custom";

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // Every open starts from the applied range, so abandoned picks never linger.
    if (next) setDraft(value);
  };

  const apply = (range: CustomRange) => {
    setDraft(range);
    onApply(range);
    setOpen(false);
  };

  const selected: DateRange | undefined = draft.from
    ? { from: fromISO(draft.from) ?? undefined, to: draft.to ? fromISO(draft.to) ?? undefined : undefined }
    : undefined;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Pick a custom date range"
          title="Pick a custom date range"
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors",
            active ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {appliedLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="max-h-[var(--radix-popover-content-available-height)] w-auto max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-2xl border-border/60 p-0 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row">
          <aside className="flex shrink-0 flex-wrap gap-1 border-b border-border/60 p-2.5 sm:w-44 sm:flex-col sm:flex-nowrap sm:gap-0.5 sm:border-b-0 sm:border-e">
            <p className="w-full px-2 pb-1 pt-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:pb-1.5 sm:pt-1">
              Quick ranges
            </p>
            {PRESETS.map((preset) => {
              const range = preset.build();
              const isCurrent = range.from === draft.from && range.to === draft.to;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => apply(range)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:rounded-lg sm:px-2 sm:text-start sm:text-sm sm:font-semibold",
                    isCurrent
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
            <p className="mt-auto hidden px-2 pb-1 pt-4 text-[11px] font-medium leading-relaxed text-muted-foreground sm:block">
              Or pick any start and end date on the calendar — spans over 180 days are grouped by month.
            </p>
          </aside>

          <div className="min-w-0">
            <Calendar
              mode="range"
              numberOfMonths={isMobile ? 1 : 2}
              captionLayout="dropdown"
              // The month/year dropdowns already show the title — hide the duplicate caption.
              classNames={{ caption_label: "sr-only" }}
              fromYear={2015}
              toYear={today.getFullYear()}
              disabled={{ after: today }}
              defaultMonth={selected?.from ?? daysAgo(-30)}
              selected={selected}
              onSelect={(next?: DateRange) =>
                setDraft({
                  from: next?.from ? toISO(next.from) : "",
                  to: next?.to ? toISO(next.to) : "",
                })
              }
            />
            <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-popover/95 px-3 py-2.5 backdrop-blur-sm">
              <span className="text-xs font-semibold text-muted-foreground">
                {valid ? (
                  <>
                    <span className="num">{shortDay(draft.from)} → {shortDay(draft.to)}</span>
                    <span className="num"> · {spanInDays(draft)} days</span>
                  </>
                ) : (
                  "Pick a start and an end date"
                )}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs"
                  onClick={() => {
                    setDraft({ from: "", to: "" });
                    onClear();
                  }}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs"
                  disabled={!valid}
                  onClick={() => apply(draft)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
