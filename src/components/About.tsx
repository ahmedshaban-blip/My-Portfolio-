import { Fragment } from "react";
import { Code2, Globe2, Smartphone, Terminal, type LucideIcon } from "lucide-react";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { SectionReveal, SectionItem } from "@/components/animations/SectionReveal";
import { HoverCard } from "@/components/animations/HoverCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Segments } from "@/components/Segments";
import { about } from "@/data/profile";
import { playStoreApps } from "@/data/projects";

/**
 * The JSON stores each highlight's icon as a KEY, not a component, so the copy
 * stays editable data. Valid keys are listed in `src/data/profile/README.txt`
 * (`smartphone` | `globe` | `globe2` | `database` | `code2` | `terminal`).
 */
const ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  globe: Globe2,
  globe2: Globe2,
  code2: Code2,
  terminal: Terminal,
};

const About = () => {
  const playAppsCount = playStoreApps.length;

  return (
    <section id="about" className="section-padding relative">
      {/* One bloom, low-strength, behind the content — the section's only
          decorative layer. */}
      <div aria-hidden="true" className="uv-orb -left-[10%] bottom-[-12%] h-80 w-80" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl">
            <SectionHeading eyebrow={about.heading.eyebrow} title={about.heading.title} />

            <RevealOnScroll className="mt-8 space-y-5 text-center text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]">
              {about.bio.map((paragraph, i) => (
                <p key={i} className="text-pretty">
                  <Segments items={paragraph} />
                </p>
              ))}
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              {/* Authored numbers come from `about.json`; the Play Store count
                  stays computed from the project data so it can never drift. */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-10">
                {about.stats.map((stat, index) => (
                  <Fragment key={stat.label}>
                    {index > 0 && (
                      <div
                        className="hidden h-14 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:block"
                        aria-hidden="true"
                      />
                    )}
                    <div className="text-center">
                      <p className="text-4xl font-bold tracking-tight text-accent-strong tabular-nums md:text-5xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </Fragment>
                ))}

                {about.stats.length > 0 && (
                  <div
                    className="hidden h-14 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:block"
                    aria-hidden="true"
                  />
                )}
                <div className="text-center">
                  <p className="text-4xl font-bold tracking-tight text-accent-strong tabular-nums md:text-5xl">
                    {playAppsCount}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    App{playAppsCount === 1 ? "" : "s"} Live on Google Play
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* The four practice cards are one list, so they arrive as one
              staggered group on the section rather than four separate pops. */}
          <SectionReveal className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.highlights.map((item, index) => {
              const Icon = ICONS[item.icon] ?? Terminal;
              return (
                <SectionItem key={index} className="h-full">
                  <HoverCard scale={1.02} className="h-full">
                    <div className="uv-panel group h-full transition-colors duration-300 hover:border-primary/50">
                      <div className="space-y-3 p-6 text-center sm:text-left">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-accent-strong transition-transform duration-300 group-hover:scale-110 sm:mx-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-base font-semibold tracking-tight text-foreground">
                            {item.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </HoverCard>
                </SectionItem>
              );
            })}
          </SectionReveal>
        </div>
      </div>
    </section>
  );
};

export default About;
