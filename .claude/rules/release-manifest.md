---
paths:
  - "module.json"
  - "package.json"
  - "CHANGELOG.md"
  - "README.md"
  - ".github/**"
---
<!-- SYNCED COPY: identical in foundry-getting-lost, foundry-rotate-scene, foundry-wled. Change all copies together. -->
# Release and manifest rules

- Keep the tokens `#{VERSION}#`, `#{URL}#`, `#{MANIFEST}#`, `#{DOWNLOAD}#` in `module.json`. Never hard-code a version or URL in their place.
- `library` is a boolean (`false`/`true`), never a string.
- `id` equals the repo and folder name.
- Declare `relationships` with `compatibility` (`minimum`, `verified`) for each required package.
- Top-level `compatibility.minimum` is `13`; `verified` is the highest tested version (currently `14`).
- A dnd5e relationship uses its own `compatibility`: `minimum` `5.3.3`, `verified` the latest tested 6.x. Never apply `13` to it.
- Prefer `esmodules` over `scripts`. Do not list empty or unused files.
- Every path referenced by `module.json` (esmodules, styles, languages, packs) must be included by the release workflow's `zip` step.
- Do not bump versions, tag, or release unless asked.
- Update `CHANGELOG.md` in its existing nested-bullet format, under "Unreleased".
- Keep README compatibility badges in sync with `compatibility`.
- `module.json` must stay valid JSON. Validate after every edit.
