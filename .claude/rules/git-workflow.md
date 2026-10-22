<!-- SYNCED COPY: identical in foundry-getting-lost, foundry-rotate-scene, foundry-wled. Change all copies together. -->
# Git workflow rules

- One branch per change: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`.
- Never commit to `main`. If on `main`, create a branch first.
- Commit messages: imperative mood, descriptive (`Add fetch timeout to WLED client`).
- Keep standards fix-ups (strict upgrade rule) and the functional change in separate commits; fix-up first.
- Ask the user before: `git push`, `git tag`, `gh release`, `gh pr create`, `npm publish`.
- Never force-push, rewrite published history, or bump versions unless explicitly asked.
- Synced files, identical in `foundry-getting-lost`, `foundry-rotate-scene`, and `foundry-wled`:
  - `.claude/rules/foundry-api.md`
  - `.claude/rules/security.md`
  - `.claude/rules/code-quality.md`
  - `.claude/rules/git-workflow.md`
  - `.claude/rules/release-manifest.md`
  - `.claude/rules/templates-i18n-css.md`
  - `.claude/settings.json`
  - `.editorconfig`
  - `.prettierrc.json`
  - `.prettierignore`
  - `eslint.config.mjs`
  - `.github/workflows/ci.yml`
  - `.github/dependabot.yml`
- `.claude/settings.json` is synced even though JSON cannot carry the sync comment.
- Change synced files identically in all three repos in the same session. Verify with `diff`.
- Personal permission overrides go in `.claude/settings.local.json` (uncommitted), never in `.claude/settings.json`.
