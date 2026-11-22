import { Code2, Globe2, Smartphone, Terminal } from "lucide-react";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { SectionReveal, SectionItem } from "@/components/animations/SectionReveal";
import { HoverCard } from "@/components/animations/HoverCard";
import { SectionHeading } from "@/components/SectionHeading";
import { playStoreApps } from "@/data/projects";

const About = () => {
  const highlights = [
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "Mobile Dev",
      description: "Flutter and React Native, structured with Clean Architecture.",
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: "Web Tech",
      description: "React, Redux Toolkit, and Tailwind CSS.",
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      title: "Clean Code",
      description: "Production code that stays maintainable after launch.",
    },
    {
      icon: <Globe2 className="w-5 h-5" />,
      title: "Integrations",
      description: "Firebase, Supabase, Stripe, and PayPal integrations.",
    },
  ];

  // The reference's two opening paragraphs, re-pointed at Ahmed's own practice.
  const paragraphs = [
    <>
      As a passionate software engineer, I thrive on the intricate dance between logic and
      creativity. Currently immersed in the dynamic world of mobile and web development, my
      expertise centers around <span className="font-semibold text-foreground">Flutter</span>,
      where I seamlessly blend technology with innovation.
    </>,
    <>
      With a fervor for crafting elegant solutions, I navigate the ever-evolving landscape of
      software development. My journey involves translating concepts into code, creating seamless
      user experiences, and constantly pushing the boundaries of what&apos;s possible.
    </>,
    <>
      I hold a{" "}
      <span className="font-semibold text-foreground">Bachelor&apos;s Degree in Computer Science</span>{" "}
      from the Faculty of Computer and Information, Minya University, and trained as a Front-end and
      Cross-Platform Developer at the{" "}
      <span className="font-semibold text-foreground">Information Technology Institute (ITI)</span>.
      Most of my mobile work is Flutter and React Native with Clean Architecture and API
      integrations; on the web I use React and Redux Toolkit.
    </>,
  ];

  return (
    <section id="about" className="section-padding relative">
      {/* One bloom, low-strength, behind the content — the section's only
          decorative layer. */}
      <div aria-hidden="true" className="uv-orb -left-[10%] bottom-[-12%] h-80 w-80" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl">
            <SectionHeading eyebrow="Explore Now" title="About Me" />

            <RevealOnScroll className="mt-8 space-y-5 text-center text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="text-pretty">
                  {paragraph}
                </p>
              ))}
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              {/* Single home for the 10+ fact — ITI + A+ live in Experience. */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-10">
                <div className="text-center">
                  <p className="text-4xl font-bold tracking-tight text-accent-strong tabular-nums md:text-5xl">
                    10+
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Projects Completed</p>
                </div>
                <div
                  className="hidden h-14 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:block"
                  aria-hidden="true"
                />
                <div className="text-center">
                  <p className="text-4xl font-bold tracking-tight text-accent-strong tabular-nums md:text-5xl">
                    {playStoreApps.length}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    App{playStoreApps.length === 1 ? "" : "s"} Live on Google Play
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* The four practice cards are one list, so they arrive as one
              staggered group on the section rather than four separate pops. */}
          <SectionReveal className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, index) => (
              <SectionItem key={index} className="h-full">
                <HoverCard scale={1.02} className="h-full">
                  <div className="uv-panel group h-full transition-colors duration-300 hover:border-primary/50">
                    <div className="space-y-3 p-6 text-center sm:text-left">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-accent-strong transition-transform duration-300 group-hover:scale-110 sm:mx-0">
                        {item.icon}
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
            ))}
          </SectionReveal>
        </div>
      </div>
    </section>
  );
};

export default About;
