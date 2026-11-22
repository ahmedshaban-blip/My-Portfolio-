import type { ReactNode } from "react";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { cn } from "@/lib/utils";

/**
 * The reference's section heading, reused verbatim by every band: a centred
 * uppercase title, and BELOW it a small, widely-tracked accent eyebrow
 * ("EXPLORE NOW"). It is the one heading rhythm on the page, so the sections
 * read as one document rather than five panels that each invented a header.
 *
 * The band drops in from the top edge (`direction="down"`) because it sits
 * above the content it introduces — the page's own reading order.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  /** The tracked accent label under the title, e.g. "Explore Now". */
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <RevealOnScroll direction="down">
      <div className={cn("flex flex-col items-center text-center", className)}>
        <h2 className="text-balance text-[clamp(2.25rem,6vw,2.85rem)] leading-[1.05] text-foreground">
          {title}
        </h2>
        <p className="uv-label mt-3">{eyebrow}</p>
        {description && (
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]">
            {description}
          </p>
        )}
      </div>
    </RevealOnScroll>
  );
}
