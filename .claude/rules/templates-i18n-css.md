---
paths:
  - "**/*.hbs"
  - "**/*.html"
  - "**/languages/**"
  - "**/*.css"
---
<!-- SYNCED COPY: identical in foundry-getting-lost, foundry-rotate-scene, foundry-wled. Change all copies together. -->
# Templates, i18n, and CSS rules

- Every user-facing string goes through `game.i18n` (`localize` / `format`). No hard-coded UI text.
- Namespace i18n keys by module id (`<module-id>.Section.Key`). Add every key to `en.json` in the module's languages folder.
- Language files must remain valid JSON. Remove keys that are no longer used.
- Templates are presentation only. Use simple helpers; compute data in `_prepareContext` of the application or sheet.
- Preload partials with `foundry.applications.handlebars.loadTemplates`.
- Use `{{ }}` by default. `{{{ }}}` only as allowed by `security.md`.
- CSS: scope every selector under a module root class. No bare element or global selectors.
- Use Foundry CSS variables (`var(--...)`) for colors so light and dark themes work. No hard-coded text or background colors.
- Never override core styles globally.
- Core CSS lives in `@layer`s since v13. Unlayered module CSS wins over layered core CSS; rely on that instead of `!important`.
