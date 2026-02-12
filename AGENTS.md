# AGENTS.md

Instructions for agentic coding tools working in this repository.
Scope: whole monorepo (`api`, `frontend`, `content`, `scripts`).

## 1) Project Map
- `api/`: NestJS 10 backend API.
- `frontend/`: Angular 21 SSR app (standalone components + Tailwind CSS 4).
- `content/`: source markdown + JSON content.
- `scripts/build-content.ts`: content pipeline.
- `generated/`: generated artifacts (do not edit manually).

## 2) Toolchain
- Package manager: `npm` (workspaces configured in root `package.json`).
- Use existing workspace scripts; do not introduce pnpm/yarn lockfiles.
- Root install command: `npm install`.

## 3) Build/Lint/Test Commands
Run from repo root unless a section says otherwise.

### Workspace-wide
- `npm run dev` - run API + frontend concurrently.
- `npm run build` - build content, API, and frontend.
- `npm run lint` - lint API and frontend.
- `npm run test` - run API and frontend tests.

### Content pipeline
- `npm run build:content` - regenerate files under `generated/`.

### API (NestJS)
- `npm run --workspace api start:dev`
- `npm run --workspace api build`
- `npm run --workspace api lint`
- `npm run --workspace api lint:fix`
- `npm run --workspace api test`
- `npm run --workspace api test:cov`
- `npm run --workspace api test:e2e`

### Frontend (Angular)
- `npm run --workspace frontend start`
- `npm run --workspace frontend build`
- `npm run --workspace frontend lint`
- `npm run --workspace frontend lint:fix`
- `npm run --workspace frontend test`

## 4) Single-Test Commands (Use These)

### Frontend single spec file
- `npm run --workspace frontend test -- --watch=false --include="src/app/path/to/file.spec.ts"`

### Frontend single test name (suite/spec regex)
- `npm run --workspace frontend test -- --watch=false --include="src/app/path/to/file.spec.ts" --filter="should render"`

### Frontend list discovered tests
- `npm run --workspace frontend test -- --list-tests`

### API single spec file (Jest)
- `npm run --workspace api test -- --runTestsByPath src/path/to/file.spec.ts`

### API single test name
- `npm run --workspace api test -- --runTestsByPath src/path/to/file.spec.ts -t "should return health"`

### API list discovered tests
- `npm run --workspace api test -- --listTests`

## 5) Validation Expectations
- Frontend-only change: run frontend `lint` + `build`; run targeted tests when present.
- API-only change: run API `lint` + `build`; run targeted tests when present.
- Cross-workspace change: run root `lint` + `build`; run `test` or explain why skipped.
- Content/data schema change: run `npm run build:content` and verify generated JSON shape.

## 6) Formatting Rules (Source of Truth)
Defined in root `.prettierrc.json`:
- `printWidth: 100`
- `tabWidth: 4`
- `useTabs: false`
- `singleQuote: true`
- `semi: true`
- Angular HTML parser override for `*.html`

Formatting conventions:
- Use semicolons and single quotes.
- Keep code readable and close to 100 columns.
- Keep functions focused; avoid large multipurpose blocks.
- Avoid comments for obvious code; comment only non-trivial intent.

## 7) Imports, Structure, and Naming
- Import order: external/framework first, then internal imports.
- Use one blank line between import groups.
- Remove unused imports.
- Prefer existing folder patterns over introducing new top-level structures.

Naming:
- Files and folders: kebab-case.
- Classes/components/services/modules: PascalCase.
- Variables/functions/methods: camelCase.
- Interfaces/types: PascalCase.
- Constants: UPPER_SNAKE_CASE only for real constants.

## 8) TypeScript Guidelines

### Frontend (`frontend/tsconfig.json` is strict)
- Favor explicit types on public APIs and service methods.
- Avoid `any`; use `unknown` + narrowing.
- Use generics in reusable service helpers.
- Handle null/undefined states explicitly.

### API (`api/tsconfig.json` is looser)
- Still write strict-style code.
- Add explicit return types for public controller/service methods.
- Avoid spreading `any` in new code.

## 9) Frontend Conventions (Angular)
- Use standalone components and lazy route loading patterns already in place.
- Prefer `inject(...)` over constructor injection in frontend classes (lint presets enforce this).
- Use signals for local component state where appropriate.
- Put shared app logic in `core/services` and request-wide handling in interceptors.
- Keep templates accessible and lint-clean (template accessibility rules are enabled).

## 10) Backend Conventions (NestJS)
- Preserve controller -> service layering.
- Validate input DTOs with `class-validator`.
- Use Nest HTTP exceptions for expected error cases.
- Do not leak sensitive internals in responses/logs.
- Keep modules cohesive; register providers/controllers in the proper module.

## 11) Error Handling and Logging
- Frontend: centralize HTTP handling in interceptor/service pipelines.
- Frontend: retries only when safe/idempotent.
- API: add context in catches, otherwise let framework-level handlers surface errors.
- Log useful context (operation, route, IDs), never secrets/tokens.

## 12) Generated and Ignored Artifacts
- Never hand-edit `generated/`, `dist/`, or coverage artifacts.
- Change source files (`content/`, `src/`) and regenerate as needed.
- Commit generated content only if repository policy changes; currently it is gitignored.

## 13) Cursor/Copilot Rules
Checked and not found at the time this file was created:
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

If any of those files are added later, treat them as higher-priority repo instructions and update this file.

## 14) Agent Workflow Notes
- Make minimal, scoped changes.
- Prefer root-cause fixes over silencing lint/test errors.
- Align with existing code style in touched files.
- Add tests near changed behavior when practical.
- Before finishing, include what you ran (`lint/build/test`) and any skipped checks.
