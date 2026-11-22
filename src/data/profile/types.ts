/**
 * The TYPES behind the `.json` files in this folder.
 *
 * These interfaces — not the zod schemas in `validate.ts` — are what components
 * see. `index.ts` annotates every JSON import with one of them, so if you edit a
 * `.json` into a shape that does not match, `npm run build` / your editor fails
 * immediately and points at the field.
 *
 * `validate.ts` holds the matching zod schemas, which only exist to print a
 * friendly message in the browser during `npm run dev`. When you add a field:
 * add it to the `.json`, to the interface here, and to the schema in
 * `validate.ts` (extra JSON fields are allowed; a missing one is reported).
 */

/**
 * A run of text inside a paragraph.
 * - `strong`  → bold, foreground colour
 * - `accent`  → accent colour (used by the hero tagline)
 * - `ariaHidden` → hidden from screen readers (the hero emoji)
 */
export type Segment = {
  text: string;
  strong?: boolean;
  accent?: boolean;
  ariaHidden?: boolean;
};

/** One dated row: role on the left, the date on the right, prose under both. */
export type Role = {
  company: string;
  title: string;
  /** Free-text display string, e.g. `"Jan 2026 – Present, Saudi Arabia"`. */
  date: string;
  /** Responsibilities, written as sentences so the block reads as prose. */
  summary?: string[];
  tech: string[];
  /** Free-text line under the prose, e.g. `"Graduation Project Grade:"`. */
  note?: string;
  /** Rendered bold + success-coloured right after `note`, e.g. `"A+"`. */
  grade?: string;
};

export type Identity = {
  name: {
    first: string;
    last: string;
    display: string;
    /** Full legal name — currently only shown inside the CV PDFs. */
    legal: string;
  };
  jobTitle: string;
  role: {
    title: string;
    company: string;
    companyCountry: string;
    /** e.g. `"Full-time"` */
    employment: string;
  };
  hero: {
    greeting: string;
    tagline: Segment[];
    intro: string;
    availabilityBadge: string;
    photo: {
      /** Path prefix without the size, e.g. `"/images/personal-image"`. */
      base: string;
      /** The default `<img>` size — also the `src` suffix: `-640.webp`. */
      width: number;
      height: number;
      /** Every generated width; each needs a file in `public/images/`. */
      widths: number[];
    };
  };
};

export type Contact = {
  email: string;
  phone: {
    /** How the number is displayed, e.g. `"(+20) 1114975104"`. */
    display: string;
    /** The `tel:` target, e.g. `"+201114975104"`. */
    e164: string;
  };
  whatsapp: {
    /** Digits only, no `+` — the `wa.me` path segment. */
    number: string;
    /** Prefilled message in the chat. */
    message: string;
  };
};

export type Social = {
  github: string;
  linkedin: string;
  /** Only used by the `twitter:site` meta tag in `index.html`. */
  twitterHandle: string;
};

export type Location = {
  city: string;
  country: string;
  /** e.g. `"GMT+2"` */
  timezone: string;
  /** Where you are from — shown nowhere yet, kept for copy reuse. */
  origin: string;
  availableToRelocate: boolean;
  /** e.g. `"Open to remote & on-site"` */
  workModes: string;
};

export type About = {
  heading: { eyebrow: string; title: string };
  /** One array of segments per paragraph. */
  bio: Segment[][];
  highlights: { icon: string; title: string; description: string }[];
  /** Authored headline numbers. Computed ones are never listed here. */
  stats: { value: string; label: string }[];
};

export type Experience = {
  roles: Role[];
  coursesHeading: string;
  courses: string[];
};

export type Education = {
  degree: Role;
};

export type Skills = {
  categories: {
    /** A key from the `ICONS` map in `src/components/Skills.tsx`. */
    icon: string;
    title: string;
    description: string;
    skills: string[];
    /** How many chips show before the "Show all" toggle. */
    visibleCount: number;
    /** Optional grid span, e.g. `"md:col-span-2"`. */
    colSpan?: string;
  }[];
};

export type Languages = {
  languages: { name: string; level: string }[];
};

export type CV = {
  tracks: {
    flutter: CVTrackConfig;
    frontend: CVTrackConfig;
  };
};

export type CVTrackConfig = {
  label: string;
  description: string;
  /** MUST match the file name uploaded to Cloudinary (env: cloud name). */
  cloudinaryPublicId: string;
  /** The name the visitor sees when the file downloads. */
  fileName: string;
  /** Local files in `public/`, tried in order when Cloudinary is down. */
  fallbackUrls: string[];
};
