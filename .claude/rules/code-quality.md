<!-- SYNCED COPY: identical in foundry-getting-lost, foundry-rotate-scene, foundry-wled. Change all copies together. -->
# Code quality rules

- Modern ESM: `const`/`let` (no `var`), `import`/`export`, `#private` class fields.
- Every `async`/`await` path handles errors (`try`/`catch` or explicit rejection handling). No floating promises.
- No stray `console.*`. Log through the module logger, with messages prefixed by the module id.
- TypeScript repos: `strict` stays on. No `any` without a comment justifying it. `npx tsc --noEmit` must pass.
- Run `npm run check` before every commit.
- Never add an `eslint-disable` without a `-- reason`.
- `-- legacy:` suppressions are removed under the strict upgrade rule when their file is touched.
- Never weaken lint, format, or CI configuration without asking the user.
- Small single-responsibility modules and functions. Descriptive names.
- No dead code, commented-out code, or unused exports/imports.
- No `TODO` without an issue reference (`TODO(#123)`).
- Match existing patterns in the repo unless the pattern is legacy (see below).
- Strict upgrade rule: before changing a file, bring the whole file up to these standards in a separate preceding commit.
- If that upgrade is migration-sized (e.g. ApplicationV1 to ApplicationV2, jQuery removal across a sheet), stop and ask the user before proceeding.
- Finish every task by running the verification checklist in `CLAUDE.md`.
- Report static check results with the actual output, not a summary of it.
- List concrete manual Foundry test steps for the change.
- Never claim in-Foundry behaviour works until the user confirms it. State what was checked statically and what remains unverified.
