/**
 * DEV-ONLY validation for the files in this folder.
 *
 * This module exists so a typo in one of the `.json` files fails loudly and
 * points at the exact field, instead of the page rendering `undefined`.
 * `index.ts` imports it behind `import.meta.env.DEV`, so none of this code
 * (and none of zod) is shipped to visitors.
 *
 * If you need to change the shape of the data, edit the schema here AND the
 * matching `.json` file — then `src/data/profile/index.ts` keeps compiling.
 */
import { z } from "zod";

import aboutJson from "./about.json";
import contactJson from "./contact.json";
import cvJson from "./cv.json";
import educationJson from "./education.json";
import experienceJson from "./experience.json";
import identityJson from "./identity.json";
import languagesJson from "./languages.json";
import locationJson from "./location.json";
import skillsJson from "./skills.json";
import socialJson from "./social.json";

/* ── Shared shapes ─────────────────────────────────────────────────────── */

/**
 * A run of text inside a paragraph.
 * - `strong`  → bold, foreground colour
 * - `accent`  → accent colour (used by the hero tagline)
 * - `ariaHidden` → hidden from screen readers (the hero emoji)
 */
export const segmentSchema = z.object({
  text: z.string(),
  strong: z.boolean().optional(),
  accent: z.boolean().optional(),
  ariaHidden: z.boolean().optional(),
});

const roleSchema = z.object({
  company: z.string(),
  title: z.string(),
  date: z.string(),
  summary: z.array(z.string()).optional(),
  tech: z.array(z.string()),
  /** Free-text line under the prose (e.g. `"Graduation Project Grade:"`). */
  note: z.string().optional(),
  /** Rendered bold + success-coloured right after `note` (e.g. `"A+"`). */
  grade: z.string().optional(),
});

/* ── identity.json ─────────────────────────────────────────────────────── */

export const identitySchema = z.object({
  name: z.object({
    first: z.string(),
    last: z.string(),
    display: z.string(),
    legal: z.string(),
  }),
  jobTitle: z.string(),
  role: z.object({
    title: z.string(),
    company: z.string(),
    companyCountry: z.string(),
    employment: z.string(),
  }),
  hero: z.object({
    greeting: z.string(),
    tagline: z.array(segmentSchema),
    intro: z.string(),
    availabilityBadge: z.string(),
    photo: z.object({
      base: z.string(),
      width: z.number(),
      height: z.number(),
      widths: z.array(z.number()),
    }),
  }),
});

/* ── contact.json ──────────────────────────────────────────────────────── */

export const contactSchema = z.object({
  email: z.string().email(),
  phone: z.object({ display: z.string(), e164: z.string() }),
  whatsapp: z.object({ number: z.string(), message: z.string() }),
});

/* ── social.json ───────────────────────────────────────────────────────── */

export const socialSchema = z.object({
  github: z.string(),
  linkedin: z.string(),
  twitterHandle: z.string(),
});

/* ── location.json ─────────────────────────────────────────────────────── */

export const locationSchema = z.object({
  city: z.string(),
  country: z.string(),
  timezone: z.string(),
  origin: z.string(),
  availableToRelocate: z.boolean(),
  workModes: z.string(),
});

/* ── about.json ────────────────────────────────────────────────────────── */

export const aboutSchema = z.object({
  heading: z.object({ eyebrow: z.string(), title: z.string() }),
  bio: z.array(z.array(segmentSchema)),
  highlights: z.array(
    z.object({ icon: z.string(), title: z.string(), description: z.string() })
  ),
  stats: z.array(z.object({ value: z.string(), label: z.string() })),
});

/* ── experience.json ───────────────────────────────────────────────────── */

export const experienceSchema = z.object({
  roles: z.array(roleSchema),
  coursesHeading: z.string(),
  courses: z.array(z.string()),
});

/* ── education.json ────────────────────────────────────────────────────── */

export const educationSchema = z.object({ degree: roleSchema });

/* ── skills.json ───────────────────────────────────────────────────────── */

export const skillsSchema = z.object({
  categories: z.array(
    z.object({
      icon: z.string(),
      title: z.string(),
      description: z.string(),
      skills: z.array(z.string()),
      visibleCount: z.number(),
      colSpan: z.string().optional(),
    })
  ),
});

/* ── languages.json ────────────────────────────────────────────────────── */

export const languagesSchema = z.object({
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
});

/* ── cv.json ───────────────────────────────────────────────────────────── */

export const cvSchema = z.object({
  tracks: z.object({
    flutter: z.object({
      label: z.string(),
      description: z.string(),
      cloudinaryPublicId: z.string(),
      fileName: z.string(),
      fallbackUrls: z.array(z.string()),
    }),
    frontend: z.object({
      label: z.string(),
      description: z.string(),
      cloudinaryPublicId: z.string(),
      fileName: z.string(),
      fallbackUrls: z.array(z.string()),
    }),
  }),
});

/* ── Public types ──────────────────────────────────────────────────────── */

/**
 * The component-facing types live in `./types.ts`, NOT here.
 * `z.infer` in zod 3.25.76 returns every property as optional, which would
 * silently make every field of the site nullable — so the interfaces are
 * authored by hand and `index.ts` annotates each JSON import with one.
 */

/* ── The dev check ─────────────────────────────────────────────────────── */

const PROFILES: Record<string, { schema: z.ZodTypeAny; data: unknown }> = {
  "identity.json": { schema: identitySchema, data: identityJson },
  "contact.json": { schema: contactSchema, data: contactJson },
  "social.json": { schema: socialSchema, data: socialJson },
  "location.json": { schema: locationSchema, data: locationJson },
  "about.json": { schema: aboutSchema, data: aboutJson },
  "experience.json": { schema: experienceSchema, data: experienceJson },
  "education.json": { schema: educationSchema, data: educationJson },
  "skills.json": { schema: skillsSchema, data: skillsJson },
  "languages.json": { schema: languagesSchema, data: languagesJson },
  "cv.json": { schema: cvSchema, data: cvJson },
};

/** Logs (never throws) one clear message per file that fails its schema. */
export function validateProfileData(): void {
  for (const [file, { schema, data }] of Object.entries(PROFILES)) {
    const result = schema.safeParse(data);
    if (result.success) continue;

    const details = result.error.issues
      .map((issue) => `    • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    console.error(
      `[profile] src/data/profile/${file} does not match its schema.\n` +
        `  Fix the file (see src/data/profile/README.txt):\n${details}`
    );
  }
}
