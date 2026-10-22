# foundry-wled

Shared standards live in `.claude/rules/` (loaded automatically); this file covers only what is specific to this package.

## What this is

Foundry VTT module (`id: foundry-wled`) that drives a real-world WLED LED strip from play: combat start, turn, round and end set segment lighting, and an actor's HP changes recolour its segment. Plain ES modules, no build, no package manifest, no tests. Targets Foundry v13 minimum / v14 verified and dnd5e 5.3.3+ / 6.x (dnd5e 6.x behaviour is partly unverified; see Foundry integration).

## Commands

No build and no npm. Static checks only (JSON validity and syntax):

- `node -e "JSON.parse(require('fs').readFileSync('module.json','utf8'))"`
- `node -e "JSON.parse(require('fs').readFileSync('languages/en.json','utf8'))"`
- `for f in scripts/*.js scripts/lib/*.js; do node --check "$f" || exit 1; done`
- `git diff --stat` before committing

## Layout

- `module.json`: manifest. Loads `scripts/module.js` (esmodule), `styles/module.css`, `languages/en.json`, plus `scripts/lib/lib.js` via `scripts`.
- `scripts/module.js`: entry. `init` registers settings; `ready` starts `actor` and `encounter`.
- `scripts/settings.js`: `FWISettings` singleton, registers and reads world settings.
- `scripts/actor.js`: `FWIActor` singleton. Per-actor LED range flags, sheet header button, HP-change hook, summon tracking, builds a segment descriptor per actor.
- `scripts/encounter.js`: `FWIEncounter` singleton. Combat hooks (GM client only), builds the de-duplicated segment list for a combat.
- `scripts/wled.js`: `FWIWled` singleton. All WLED HTTP JSON API access, segment create/update, colour maths, response cache.
- `styles/module.css` and `scripts/lib/lib.js`: both empty.
- `languages/en.json`: holds one placeholder key (`MODULE.hello`).
- `.github/workflows/main.yml`: release workflow, builds `module.zip`.

## Foundry integration

- Hooks: `init` (settings), `ready` (actor, encounter), `combatStart`, `combatTurn`, `combatRound`, `deleteCombat` (registered only when `game.user.isGM`), `updateActor`, `dnd5e.postSummon`, and `get<SheetClass>HeaderButtons` for each character sheet class.
- Settings (world scope, namespace `foundry-wled`): `enable-encounter`, `uri` (WLED address, includes `http://`), `gm-start`, `gm-end`, `gm-inactive`.
- Actor flags: `flags.foundry-wled.startLed`, `stopLed`, `parentActorId`. Read `flags.dnd5e.summonedCopy` (another package's namespace: read only, never write).
- Network: `fetch` to `<uri>/json/state` in `FWIWled._query`. The only endpoint is the user-configured `uri` setting.
- UI: a `DialogV2` per actor for start/end LED, opened from a sheet header button.
- WLED segments are matched by name. Names derive from the actor: first word of the name, lowercased, non `[a-z1-9]` stripped, plus `-pre` and `-post`. The GM area uses segment `dm`. Two actors sharing a first word share a segment.
- dnd5e: `actor.system.attributes.hp` (`value`, `max`) is read directly. `dnd5e.postSummon` and `flags.dnd5e.summonedCopy` are unverified against dnd5e 6.x (known issue, not yet fixed). Do not assume they work on 6.x; feature-detect, and check the dnd5e source or release notes before relying on them.
- Combat triggers are GM-client only. Actor HP updates (`updateActor`) fire on every client, so any client can push to WLED. Keep this in mind before adding socket or multi-client logic.

## Known legacy patterns

Per the strict upgrade rule, fix these in a separate preceding commit before changing the file. Migration-sized items: ask first.

- `scripts/wled.js` `_query`: no `AbortController` timeout, no `response.ok` or `try`/`catch`, and the failure notification is an unimplemented `TODO`. Replace with a timeout and `ui.notifications.warn` on failure (GM only, no throw into hooks).
- `scripts/wled.js` (`console.warn`, bare `TODO`s on lines ~79, 149, 161, 356) and `scripts/actor.js` (`console.warn`): replace with a module-id-prefixed logger and `TODO(#n)` issue references.
- `scripts/actor.js` `getConfigButtonClick`: interpolates `actor.id` and flag values into `DialogV2` `content` as an HTML string. Replace with escaped values or DOM construction, and put the form in a Handlebars template.
- `scripts/actor.js` `initSheet`: relies on V1 `get<SheetName>HeaderButtons` hooks and `app.object`. Replace with AppV2 header controls (`getHeaderControls...` hook or sheet `_getHeaderControls`) after checking foundryvtt.com/api/v14/. Whether this hook fires at all on dnd5e AppV2 sheets is unverified. Migration-sized: ask before converting.
- `scripts/settings.js`, `scripts/actor.js`: hard-coded English UI text (setting names and hints, dialog labels, `WLED Configurations`). Replace with `game.i18n` keys in `languages/en.json` namespaced `foundry-wled.*`; remove the placeholder `MODULE.hello`.
- `scripts/settings.js`: commented-out `use-freeze` setting. Delete it.
- `scripts/lib/lib.js` (empty, loaded via `scripts` in `module.json`) and `styles/module.css` (empty, loaded via `styles`). Remove the files and the manifest entries, or give them a purpose.
- `scripts/actor.js` `getActorSegment`: GM detection by user names `'Gamemaster'` and `'Table'`. Replace with `User#isGM` / permission-based checks.
- `scripts/wled.js` `_getActorMainSegmentKey`: regex `[^a-z1-9]` drops `0`. Fix only with care, since existing WLED segment names depend on it.
- `typescript-refactor` branch on the remote (last commit 2025-01-01, WIP) is stale. Do not use as a reference or merge from it.

## Verification checklist

Static (report actual output):

1. The two `node -e` JSON parse commands above (`module.json`, `languages/en.json`) both exit 0.
2. `for f in scripts/*.js scripts/lib/*.js; do node --check "$f" || exit 1; done`
3. `git status --porcelain` shows only intended files.

Manual in Foundry (list them for the user; unverified until the user confirms):

1. WLED address: set `WLED Address` to a reachable device. Then set it to an unreachable one and confirm the failure is reported and combat/hooks do not break.
2. GM segment: set GM start/end LEDs and inactive strength; confirm the `dm` segment appears and dims when it is not the GM's turn.
3. Combat start, turn, round, and end (delete combat): enable `Enable Auto Encounter`, confirm lighting changes at each and segments switch off at end.
4. HP colour: damage and heal a PC and an NPC; confirm segment colour moves green to red with HP.
5. Summoned creature: summon with dnd5e, confirm it uses the parent's segment and `parentActorId` flag is set (check on both dnd5e 5.3.3 and 6.x).
6. Initiative mode: a combatant with no LED range and a shared first name; confirm de-duplication and that the active turn is highlighted.
7. Sheet header button: open a character sheet, set start/end LEDs, reopen and confirm they persist.
8. Browser console: no deprecation warnings.

## Gotchas

- The release workflow's `zip` step lists folders explicitly, and its "Verify Archive Contents" step fails the release if a path referenced by `module.json` is missing. Add any new top-level folder to the `zip` step.
- `module.json` is a manifest-plus template: keep `#{VERSION}#`, `#{URL}#`, `#{MANIFEST}#`, `#{DOWNLOAD}#`.
- `module.json` `library` must be boolean `false`, not a string.
- `getSegments` caches the WLED state; the cache clears only after a non-GET `_query`. Changes made on the device directly are not seen until then.
- `scripts/wled.js` assumes segment 0 exists and builds a default segment 0 with `stop: 120` if the device returns none.
- LED indices are stored in flags as strings from the dialog and parsed with `Number.parseInt` in `getActorSegment`.
