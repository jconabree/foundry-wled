<!-- SYNCED COPY: identical in foundry-getting-lost, foundry-rotate-scene, foundry-wled. Staging copy: foundry14/shared-claude/. Change all copies together. -->
# Security rules

- Never write user, document, or setting data through `innerHTML`, `insertAdjacentHTML`, or `outerHTML`.
- Render untrusted text with `textContent`, DOM construction (`createElement`), or Handlebars `{{ }}`.
- Render rich text with `foundry.applications.ux.TextEditor.enrichHTML` and `secrets: doc.isOwner`.
- `foundry.utils.cleanHTML` is not a full XSS sanitizer. Never treat its output as safe.
- Use `{{{ }}}` only for enriched or trusted HTML, with an adjacent comment stating why it is safe.
- Check permissions with `doc.canUserModify(user, action)` or `doc.testUserPermission(user, level)`. Do not rely only on `game.user.isGM`.
- Assistant GMs (v14) hold GM rights except FILES_UPLOAD, MACRO_SCRIPT, and SETTINGS_MODIFY. Do not gate on role names alone.
- Socket payloads are untrusted. Validate shape, types, and sender permissions on receipt.
- Run privileged socket actions on exactly one client: the active GM (`game.users.activeGM`).
- Network calls go only to user-configured endpoints. Never hard-code third-party hosts.
- Every `fetch` uses an `AbortController` timeout.
- On network failure: notify the user via `ui.notifications` and continue. Never throw into the game loop or hooks.
- Never send document, actor, or user data to third parties.
- No `eval`, `new Function`, string-form `setTimeout`/`setInterval`, dynamic `<script>` injection, or remote code loading.
- No secrets, tokens, or credentials in the repo. If credentials are unavoidable, store them in `client`-scoped settings with a visible warning to the user.
- Keep dependencies minimal. Pin git dependencies to a commit hash. Ask the user before adding any runtime dependency.
