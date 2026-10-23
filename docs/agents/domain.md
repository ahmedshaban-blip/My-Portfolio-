# Domain Docs — Single Context Layout

This repo uses a **single-context** layout for domain documentation:

- **`GLOSSARY.md`** at the repo root — contains all domain terms and vocabulary
- **`docs/adr/`** at the repo root — contains Architecture Decision Records

## Consumer Rules

When reading or referencing domain docs:

1. All terms are resolved from the root `GLOSSARY.md` first
2. ADRs in `docs/adr/` reference terms from `GLOSSARY.md`
3. No `GLOSSARY-MAP.md` is needed (multi-context not used)
4. New ADRs should be named `NNNN-short-description.md` where NNNN is a sequential number

## Conventions

- Add new domain terms to `GLOSSARY.md` when they first appear
- Create ADRs for significant decisions before implementation
- Reference `GLOSSARY.md` terms using the established link format