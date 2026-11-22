/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH for every personal detail shown on the site.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Everything a visitor can see about Ahmed Shaban lives in this folder as
 *  plain `.json`. To change the site, edit the `.json` — you should never
 *  need to touch a component just to update a word, a link or a date.
 *
 *  Read `README.txt` in this folder before editing: it lists which values are
 *  NAME-SENSITIVE (a wrong name breaks a link silently).
 *
 *  Components import from `@/data/profile`, never from a `.json` directly.
 *  Add a new field by: (1) adding it to the `.json`, (2) adding it to the
 *  interface in `types.ts`, (3) adding it to the schema in `validate.ts` — the
 *  compiler then tells you every place that still needs it.
 */
import type {
  About,
  Contact,
  CV,
  Education,
  Experience,
  Identity,
  Languages,
  Location,
  Role,
  Segment,
  Skills,
  Social,
} from "./types";
import { validateProfileData } from "./validate";

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

/* ── Identity ──────────────────────────────────────────────────────────── */
/** Name, current role, and the hero copy. → `identity.json` */
export const identity: Identity = identityJson;

/* ── Reachability ──────────────────────────────────────────────────────── */
/** Email, phone, WhatsApp number + prefilled message. → `contact.json` */
export const contact: Contact = contactJson;

/** GitHub / LinkedIn URLs and the X handle. → `social.json` */
export const social: Social = socialJson;

/** City, country, timezone, origin, relocation. → `location.json` */
export const location: Location = locationJson;

/* ── Sections ──────────────────────────────────────────────────────────── */
/** About Me copy, highlight cards and headline stats. → `about.json` */
export const about: About = aboutJson;

/** Work history and the courses list. → `experience.json` */
export const experience: Experience = experienceJson;

/** University degree, rendered as the last row of Experience. → `education.json` */
export const education: Education = educationJson;

/** Skill categories and their icon keys. → `skills.json` */
export const skills: Skills = skillsJson;

/** Spoken languages. Not rendered anywhere yet — edit freely. → `languages.json` */
export const languages: Languages = languagesJson;

/** CV tracks: Cloudinary ids, download names and local fallbacks. → `cv.json` */
export const cv: CV = cvJson;

/* ── Derived values (computed, do not duplicate them in the JSON) ──────── */

/** e.g. `"Cairo, Egypt"` */
export const locationShort = `${location.city}, ${location.country}`;

/** e.g. `"Cairo, Egypt (GMT+2)"` */
export const locationLine = `${locationShort} (${location.timezone})`;

/** The one WhatsApp deep link, with the prefilled message from `contact.json`. */
export const whatsappUrl = `https://wa.me/${contact.whatsapp.number}?text=${encodeURIComponent(
  contact.whatsapp.message
)}`;

/** Experience rows in reading order: work history first, then the degree. */
export const allExperienceRoles: Role[] = [...experience.roles, education.degree];

/* ── Re-exported types, so components can `import type` from one place ─── */
export type {
  About,
  Contact,
  CV,
  Education,
  Experience,
  Identity,
  Languages,
  Location,
  Role,
  Segment,
  Skills,
  Social,
};

/**
 * DEV ONLY. Validates every `.json` above and logs a precise message when a
 * file no longer matches its schema. `import.meta.env.DEV` is `false` in a
 * production build, so this block (and zod with it) is dropped from the bundle.
 */
if (import.meta.env.DEV) {
  validateProfileData();
}
