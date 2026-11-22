import { Award } from "lucide-react";
import { SectionReveal, SectionItem } from "@/components/animations/SectionReveal";
import { SectionHeading } from "@/components/SectionHeading";
import { allExperienceRoles, experience } from "@/data/profile";

const chip =
  "px-3 py-1 text-[0.6875rem] font-medium rounded-full border border-border/70 text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:text-accent-strong cursor-default";

/**
 * Rows come from `src/data/profile/experience.json` (work history) and
 * `education.json` (the degree, rendered last). Add a role by adding an entry to
 * the `roles` array — no change here is ever needed for a content edit.
 */
const Experience = () => (
  <section id="experience" className="section-padding relative">
    {/* Decorative layer: two low-strength blooms, one per flank, contained. */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="uv-orb -right-[6%] top-[12%] h-72 w-64" />
      <div className="uv-orb -left-[6%] bottom-[12%] h-72 w-64" />
    </div>

    <div className="container relative z-10 mx-auto px-4">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Explore Now"
          title="Experience"
          description="Roles and degree, most recent first."
          className="mb-14"
        />

        {/* A timeline is a sequence, so the rows descend from the top edge in
            the order their dates already read. */}
        <SectionReveal>
          {allExperienceRoles.map((role) => (
            <SectionItem key={role.company} direction="down">
              <article className="border-t border-border/60 py-10 first:border-t-0 first:pt-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <h3 className="text-pretty text-lg font-bold leading-snug text-foreground md:text-xl">
                    {role.company}{" "}
                    <span className="font-normal text-muted-foreground">/ {role.title}</span>
                  </h3>
                  <p className="shrink-0 text-[0.6875rem] font-medium uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
                    {role.date}
                  </p>
                </div>

                {role.summary && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
                    {role.summary.join(" ")}
                  </p>
                )}

                {role.note && (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <Award className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    {role.note}
                    {role.grade && (
                      <span className="font-bold text-success">{role.grade}</span>
                    )}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {role.tech.map((item) => (
                    <span key={item} className={chip}>
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            </SectionItem>
          ))}

          <SectionItem direction="down">
            <article className="border-t border-border/60 py-10">
              <h3 className="text-lg font-bold text-foreground md:text-xl">
                {experience.coursesHeading}
              </h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {experience.courses.map((course) => (
                  <span key={course} className={chip}>
                    {course}
                  </span>
                ))}
              </div>
            </article>
          </SectionItem>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default Experience;
