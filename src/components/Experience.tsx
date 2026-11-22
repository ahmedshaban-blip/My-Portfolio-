import { Award } from "lucide-react";
import { SectionReveal, SectionItem } from "@/components/animations/SectionReveal";
import { SectionHeading } from "@/components/SectionHeading";

/** One dated row: role on the left, the date on the right, prose under both. */
type Role = {
  company: string;
  title: string;
  date: string;
  /** Responsibilities, written as sentences so the block reads as prose. */
  summary?: string[];
  tech: string[];
  /** Extra note rendered under the prose (e.g. the graduation grade). */
  note?: string;
};

const ROLES: Role[] = [
  {
    company: "Truck World",
    title: "Front-end (ERP Next, React.js) and Flutter Developer",
    date: "Jan 2026 – Present, Saudi Arabia",
    summary: [
      "Develop and maintain web applications using React.js.",
      "Build responsive, user-friendly interfaces from Figma and Adobe XD.",
      "Integrate RESTful APIs and handle data flow across the app.",
      "Collaborate with designers and backend developers for seamless integration.",
      "Use Git for version control and effective team collaboration.",
      "Build and maintain HR management applications.",
    ],
    tech: ["React.js", "Redux", "Tailwind CSS", "Flutter", "REST APIs", "Git"],
  },
  {
    company: "Sawa",
    title: "Flutter Developer",
    date: "Feb 2026 – Present, Alexandria, Egypt",
    summary: [
      "Develop and maintain mobile applications using Flutter and Dart.",
      "Build responsive and user-friendly UI from Figma and Adobe XD.",
      "Integrate RESTful APIs and handle data flow.",
      "Assist in app deployment on Google Play and the Apple App Store.",
    ],
    tech: ["Flutter", "Dart", "REST APIs", "Google Play", "App Store"],
  },
  {
    company: "Information Technology Institute (ITI)",
    title: "Front-end and Cross-Platform Developer",
    date: "Jul 2025 – Nov 2025, Egypt",
    summary: [
      "Developed production-ready mobile screens using Flutter.",
      "Implemented state management with Bloc, Cubit, and GetX.",
      "Integrated REST APIs and handled JSON parsing.",
      "Worked with Firebase Auth, Firestore, and push notifications.",
      "Built engaging web UIs using React and Redux.",
      "Integrated Stripe and PayPal payments.",
      "Followed Clean Architecture principles and Git/GitHub workflows.",
    ],
    tech: ["Flutter", "Bloc/Cubit", "GetX", "Firebase", "React", "Stripe", "PayPal"],
  },
  {
    company: "Faculty of Computer and Information, Minya University",
    title: "Bachelor's Degree in Computer Science",
    date: "Sep 2020 – Jan 2025, Egypt",
    summary: [
      "Solid coursework in software engineering, algorithms, and problem-solving, applied to the architecture of the projects above.",
    ],
    tech: ["Software Engineering", "Algorithms", "Clean Architecture"],
    note: "Graduation Project Grade: A+",
  },
];

const COURSES = [
  "Deep Dive into Clean Architecture in Flutter",
  "Flutter Advanced – Clean Architecture & MVVM",
  "Flutter – Animations from Zero to Hero",
  "Mastering Flutter: Responsive & Adaptive UI Design",
  "Complete Flutter & Dart Development Course",
  "HTML, CSS, and JavaScript (ITI)",
  "React Native Web Application (ITI)",
  "Payment Integration: Stripe, PayPal & More (ITI)",
];

const chip =
  "px-3 py-1 text-[0.6875rem] font-medium rounded-full border border-border/70 text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:text-accent-strong cursor-default";

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
          {ROLES.map((role) => (
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
                    {role.note.replace("A+", "")}
                    <span className="font-bold text-success">A+</span>
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
                Selected Courses &amp; Certifications
              </h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {COURSES.map((course) => (
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
