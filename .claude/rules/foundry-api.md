<!-- SYNCED COPY: identical in foundry-getting-lost, foundry-rotate-scene, foundry-wled. Staging copy: foundry14/shared-claude/. Change all copies together. -->
# Foundry API rules

- Target: minimum v13, verified v14. Use v13+ APIs only; no v12 shims or fallbacks.
- No deprecated globals (e.g. bare `renderTemplate`, `TextEditor`). Use the namespaced forms: `foundry.applications.handlebars.*` (`renderTemplate`, `loadTemplates`), `foundry.applications.ux.TextEditor`, `foundry.utils.*`.
- Core removes deprecated globals in future majors. Before using any global, check the v14 API docs at foundryvtt.com/api/v14/ for its namespaced replacement.
- UI: `ApplicationV2` with `HandlebarsApplicationMixin`; `DocumentSheetV2` for document sheets; `DialogV2` for dialogs.
- Never use `Application`, `FormApplication`, `DocumentSheet`, or `Dialog` (ApplicationV1, deprecated since v13).
- No jQuery. No `$(...)`. Use DOM APIs (`querySelector`, `addEventListener`).
- AppV2 render hooks receive an `HTMLElement`, not a jQuery object.
- Custom document subtypes: define a `TypeDataModel` and declare it in `module.json` `documentTypes`.
- Settings: register in the `init` hook; use DataField types; localize `name` and `hint`; choose `world`, `client`, or `user` scope deliberately and per setting.
- Store module data on documents in module-scoped flags (`flags.<module-id>`) or in own subtype system data. Never write to another package's flag namespace.
- Hook lifecycle order: `init` -> `i18nInit` -> `setup` -> `ready`. Register in the earliest correct phase. Read `game.*` data only once it exists (`i18n` after `i18nInit`, documents after `setup`, canvas after `canvasReady`).
- No module-level side effects at import time beyond registering hooks.
- Never monkey-patch core classes or prototypes. Use hooks. Ask the user before any patch and state why no hook suffices.
- Console deprecation warnings are bugs. Fix them; do not suppress them.
- v14 changes to account for: Measured Templates are removed (use Scene Regions); Scene Levels exist; Active Effects V2; `updateSource` operator changes; TinyMCE is removed. Check foundryvtt.com/api/v14/ before touching these areas.
- dnd5e integration (only when relevant): support 5.3.3+ and 6.x. Guard on the data shape (feature-detect fields); never assume one major version. Known 6.0 changes: chat flags moved to `system.*`, AC and senses data reshaped.
- Foundry APIs change often. Cite the docs page or source when relying on an API. If unsure, say so and check foundryvtt.com/api/v14/; never guess a signature, hook name, or flag path.
