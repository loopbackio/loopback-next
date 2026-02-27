# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

LoopBack 4 is a highly extensible Node.js and TypeScript framework for building
APIs and microservices. This is the monorepo (`loopback-next`) containing all
core packages, extensions, and examples.

## Monorepo Structure

- **packages/** — Core framework packages (~29 packages)
- **extensions/** — Optional extensions (authentication-jwt, graphql, cron,
  metrics, logging, etc.)
- **examples/** — Sample applications demonstrating features
- **acceptance/** — Database connector acceptance tests
- **fixtures/** — Test fixtures and mock services
- **bodyparsers/** — Body parser extensions
- **sandbox/** — For testing monorepo packages as local dependencies
- **benchmark/** — Performance benchmarks
- **docs/** — Jekyll-based documentation site

Managed with **Lerna** (independent versioning) and **npm workspaces**.

## Build & Development Commands

```bash
# Install dependencies (also auto-updates TypeScript project references)
npm ci

# Build all packages (incremental TypeScript compilation)
npm run build

# Full clean rebuild
npm run clean && npm run build

# Build a single package
cd packages/<name> && npm run build
```

## Testing

```bash
# Full test suite (clean + build + mocha + nyc + lint)
npm test

# Run mocha tests only (skips build/lint — useful for fast iteration)
npm run mocha

# Test a single package (builds & tests it)
cd packages/<name> && npm test

# Disable parallel test execution
npm run mocha -- -j 1

# Run CI-only heavy tests locally
CI=1 npm test
```

Test framework: **Mocha** (parallel, 10s timeout) with **NYC** coverage. Tests
run against compiled JS in `dist/__tests__/`. The `pretest` script auto-builds,
so `npm test` in a package compiles then runs tests.

Test files follow the convention `{name}.{test-type}.ts` where test-type is
`unit`, `integration`, or `acceptance`, placed under
`src/__tests__/{unit,integration,acceptance}/`.

Build wrappers from `@loopback/build`: `lb-tsc`, `lb-mocha`, `lb-eslint`,
`lb-prettier`, `lb-nyc`, `lb-clean`.

## Linting & Formatting

```bash
# Run ESLint + Prettier checks
npm run lint

# Auto-fix lint and formatting issues
npm run lint:fix
```

**Prettier** config:
`{bracketSpacing: false, singleQuote: true, printWidth: 80, trailingComma: "all", arrowParens: "avoid"}`.

Pre-commit hook (Husky + lint-staged) auto-formats staged files. Bypass with
`LINT_STAGED=0`.

## Commit Message Convention

Uses **Conventional Commits** enforced by commitlint:

```
<type>(<scope>): <subject>
```

- **type**: feat, fix, docs, style, refactor, perf, test, build, ci, chore,
  revert
- **scope**: package directory name (e.g., `core`, `rest`, `context`,
  `repository`)
- **subject**: imperative, lowercase, no trailing dot

Use `git cz` (commitizen) for interactive commit message generation.

## Key Architectural Concepts

### Dependency Injection & Context

The IoC container (`@loopback/context`) is the foundation. `@loopback/core`
re-exports all of `@loopback/context`'s public API — application code should
import from `@loopback/core`, not `@loopback/context` directly.

**Core dependency chain**: `@loopback/metadata` → `@loopback/context` →
`@loopback/core` → `@loopback/boot`, `@loopback/rest`, etc.

### Foundation vs Framework Packages

- **Foundation-level** (internal building blocks, not directly consumed by
  apps): `context`, `metadata`, `express`, `http-server`, `openapi-v3`,
  `repository-json-schema`
- **Framework-level** (everything else — used directly by applications)

In documentation and examples, always reference framework-level packages.

### TypeScript Configuration

Two sets of tsconfig files serve different purposes:

- **Root `tsconfig.json`** — Used by VS Code for cross-package navigation
  (enables "go to definition" jumping to `.ts` source, cross-package rename
  refactoring)
- **Root `tsconfig.build.json`** — Used by ESLint
- **Per-package `tsconfig.json`** — Used by `npm run build` to compile each
  package to its `dist/` directory

All extend `@loopback/build/config/tsconfig.common.json`. TypeScript project
references are auto-updated via `bin/update-ts-project-refs.js` (runs on
`postinstall`).

Key compiler options: `strict: true`, `target: es2018`, `module: commonjs`,
`experimentalDecorators: true`, `emitDecoratorMetadata: true`.

## File Naming Convention

Follows Angular-style dotted naming: `{name}.{artifact-type}.ts`

Examples: `authenticate.decorator.ts`, `boot.component.ts`,
`user.controller.ts`, `todo.repository.ts`, `application.acceptance.ts`

## Code Style Rules (ESLint)

- `@typescript-eslint/no-explicit-any`: **error** — avoid `any` types
- `@typescript-eslint/no-floating-promises`: **error** — all promises must be
  awaited or handled
- `@typescript-eslint/await-thenable`: **error**
- `@typescript-eslint/no-misused-promises`: **error**
- `@typescript-eslint/return-await`: **error**
- `@typescript-eslint/no-shadow`: **error**
- `mocha/no-exclusive-tests`: **error** — no `.only()` in committed tests
- Naming: camelCase default, PascalCase for types, UPPER_CASE for constants,
  leading underscore for private/protected members, PascalCase for mixin
  functions ending in `Mixin`

## Copyright Headers

All source files must include the copyright header:

```ts
// Copyright IBM Corp. and LoopBack contributors <year>. All Rights Reserved.
// Node module: <package-name>
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
```

Run `lb4 copyright` to update headers automatically.

## Adding a New Package

Use the helper script: `node bin/create-package.js <package-name>`. It
scaffolds, fixes up package.json, updates copyright, bootstraps dependencies,
and updates TypeScript project references.

After creation, update `CODEOWNERS` and `docs/site/MONOREPO.md`.

## Connector Limitation in Monorepo

When using datasource connectors inside the monorepo (e.g., in examples),
require the connector module directly in the config instead of using a string
name:

```ts
connector: require('loopback-connector-mongodb'); // not connector: 'mongodb'
```

This is due to how Lerna symlinks resolve module paths.

## Node.js Support

Engines: Node.js 18, 20, or 22. npm >= 7.
