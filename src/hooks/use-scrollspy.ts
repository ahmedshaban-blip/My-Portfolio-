import { useEffect, useMemo, useState } from "react";

export function useScrollSpy(sectionIds: string[], rootMargin = "-45% 0px -45% 0px") {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "home");

  const ids = useMemo(() => sectionIds.filter(Boolean), [sectionIds]);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let observed: HTMLElement[] = [];
    let rescanTimer: ReturnType<typeof setTimeout> | null = null;

    const disconnect = () => {
      observer?.disconnect();
      observer = null;
      observed = [];
    };

    // PERFORMANCE: below-fold sections mount lazily, so the observed nodes are
    // replaced after load — re-collect targets when the DOM structure changes
    // instead of leaving the observer attached to detached placeholders.
    const connect = () => {
      const elements = ids
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      if (!elements.length) return;
      if (
        elements.length === observed.length &&
        elements.every((el, i) => el === observed[i])
      ) {
        return;
      }

      disconnect();
      observed = elements;

      if (typeof IntersectionObserver === "undefined") return;

      observer = new IntersectionObserver(
        (entries) => {
          // The band is a thin strip around the viewport centre, so sections
          // (which are taller than the viewport) cross it one at a time.
          // Threshold stays 0: a ratio threshold can never be reached by a
          // section taller than the band, which is why the indicator used to
          // stay stuck on the first link.
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

          if (visible?.target?.id) setActiveId(visible.target.id);
        },
        { root: null, threshold: 0, rootMargin }
      );

      observed.forEach((el) => observer?.observe(el));
    };

    connect();

    const scheduleRescan = () => {
      if (rescanTimer !== null) return;
      rescanTimer = setTimeout(() => {
        rescanTimer = null;
        connect();
      }, 200);
    };

    const mutations =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(scheduleRescan);
    mutations?.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (rescanTimer !== null) clearTimeout(rescanTimer);
      mutations?.disconnect();
      disconnect();
    };
  }, [ids, rootMargin]);

  return activeId;
}
