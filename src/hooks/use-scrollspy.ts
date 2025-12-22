import { useEffect, useMemo, useState } from "react";

export function useScrollSpy(sectionIds: string[], rootMargin = "-30% 0px -65% 0px") {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "home");

  const ids = useMemo(() => sectionIds.filter(Boolean), [sectionIds]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { root: null, threshold: [0.1, 0.2, 0.4, 0.6], rootMargin }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootMargin]);

  return activeId;
}
