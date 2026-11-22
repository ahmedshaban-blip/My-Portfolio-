import { Fragment } from "react";
import type { Segment } from "@/data/profile";

/**
 * Renders a paragraph stored as segments in `src/data/profile/*.json`.
 * The JSON keeps the copy as data — `strong` is bold/foreground, `accent` is
 * the accent colour, and `ariaHidden` hides a decorative glyph (the hero emoji)
 * from screen readers. This component is the ONE place that maps those flags to
 * classes, so a copy edit never has to touch JSX.
 */
export const Segments = ({ items }: { items: Segment[] }) => (
  <>
    {items.map((segment, i) => {
      if (segment.ariaHidden) {
        return (
          <span key={i} aria-hidden="true">
            {segment.text}
          </span>
        );
      }
      if (segment.accent) {
        return (
          <span key={i} className="text-accent-strong">
            {segment.text}
          </span>
        );
      }
      if (segment.strong) {
        return (
          <span key={i} className="font-semibold text-foreground">
            {segment.text}
          </span>
        );
      }
      return <Fragment key={i}>{segment.text}</Fragment>;
    })}
  </>
);
