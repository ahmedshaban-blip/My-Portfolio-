import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * DayPicker styled with the portfolio's emerald tokens.
 * Styled entirely through `classNames` (react-day-picker's own stylesheet is never
 * imported) so the theme tokens stay the single source of truth.
 * Range selection renders one continuous primary band: rounded on the outer edges,
 * square in the middle.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-5 sm:flex-row",
        month: "relative space-y-3",
        caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-sm font-extrabold tracking-tight",
        caption_dropdowns: "flex items-center gap-1.5",
        dropdown:
          "rounded-lg border border-border/70 bg-background px-2 py-1 text-xs font-bold text-foreground outline-none transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring",
        dropdown_icon: "h-3 w-3 opacity-60",
        vhidden: "sr-only",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-7 w-7 rounded-full p-0 text-muted-foreground hover:text-foreground",
        ),
        nav_button_previous: "absolute start-1",
        nav_button_next: "absolute end-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "h-8 w-9 text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground",
        row: "flex w-full",
        cell: "relative h-9 w-9 p-0 text-center text-sm focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-full p-0 text-sm font-semibold aria-selected:opacity-100",
        ),
        day_today: "font-extrabold ring-1 ring-inset ring-primary/40",
        day_outside: "text-muted-foreground/45",
        day_disabled: "text-muted-foreground/35 line-through hover:bg-transparent",
        day_hidden: "invisible",
        day_selected:
          "!bg-primary !text-primary-foreground rounded-none hover:!bg-primary focus:!bg-primary",
        day_range_start: "!rounded-s-full",
        day_range_end: "!rounded-e-full",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        IconDropdown: () => <ChevronDown className="h-3 w-3" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
