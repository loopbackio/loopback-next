---
lang: en
title: 'Contributing code in LoopBack 4'
keywords: LoopBack 4.0, contributing, community
sidebar: lb4_sidebar
permalink: /doc/en/lb4/code-contrib-lb4.html
toc: false
---

# Developing LoopBack

This document describes how to develop modules living in loopback-next monorepo.
See [Monorepo overview](./MONOREPO.md) for a list of all packages.

- [Setting up development environment](#setting-up-development-environment)
- [Building the project](#building-the-project)
- [Running tests](#running-tests)
- [Coding rules](#coding-rules)
- [Working with dependencies](#working-with-dependencies)
- [File naming convention](#file-naming-convention)
- [API documentation](#api-documentation)
- [Commit message guidelines](#commit-message-guidelines)
- [Making breaking changes](#making-breaking-changes)
- [Releasing new versions](#releasing-new-versions)
- [Adding a new package](#adding-a-new-package)
- [Upgrading TypeScript/eslint](#upgrading-typescripteslint)
- [How to test infrastructure changes](#how-to-test-infrastructure-changes)
- [Renovate bot](#renovate-bot)

## Setting up development environment

Before you can start developing LoopBack, you need to install and configure few
dependencies.

- [git](https://git-scm.com/): Github's
  [Set Up Git](https://help.github.com/articles/set-up-git/) guide is a good
  source of information.
- [Node.js 8.x (LTS)](https://nodejs.org/en/download/)

You may want to configure your IDE or editor to get better support for
TypeScript too.

- [VisualStudio Code](./VSCODE.md)
- _Missing your favorite IDE/editor here? We would love to have documentation
  for more IDEs/editors! Please send a pull request to add recommended setup for
  your tool._

Before getting started, it is recommended to configure `git` so that it knows
who you are:

```sh
git config --global user.name "J. Random User"
git config --global user.email "j.random.user@example.com"
```

Please make sure this local email is also added to your
[GitHub email list](https://github.com/settings/emails) so that your commits
will be properly associated with your account and you will be promoted to
Contributor once your first commit is landed.

## Building the project

Whenever you pull updates from GitHub or switch between feature branches, make
sure to updated installed dependencies in all monorepo packages. The following
command will install npm dependencies for all packages and create symbolic links
for intra-dependencies:

```sh
npm ci
```

The next step is to compile all packages from TypeScript to JavaScript:

```sh
npm run build
```

Please note that we are automatically running the build from `pretest` script,
therefore you should not need to run this command as part of your
[red-green-refactor cycle](http://www.jamesshore.com/Blog/Red-Green-Refactor.html).

## Running tests

This is the only command you should need while developing LoopBack:

```sh
npm test
```

It does all you need:

- Compile TypeScript
- Run all tests
- Check code formatting using [Prettier](https://prettier.io/)
- Lint the code using [ESLint](https://typescript-eslint.io/)

## Coding rules

- All features and bug fixes must be covered by one or more automated tests.

- All public methods must be documented with typedoc comments (see
  [API Documentation](#api-documentation) below).

- Follow our style guide as documented on loopback.io:
  [Code style guide](http://loopback.io/doc/en/contrib/style-guide.html).

### Linting and formatting

We use two tools to keep our codebase healthy:

- [ESLint](https://typescript-eslint.io/) to statically analyse our source code
  and detect common problems.
- [Prettier](https://prettier.io/) to keep our code always formatted the same
  way, avoid style discussions in code reviews, and save everybody's time an
  energy.

You can run both linters via the following npm script, just keep in mind that
`npm test` is already running them for you.

```sh
npm run lint
```

Many problems (especially formatting) can be automatically fixed by running the
npm script `lint:fix`.

```sh
npm run lint:fix
```

## Working with dependencies

We use npm's
[package-lock feature](https://docs.npmjs.com/files/package-lock.json) to speed
up our development workflow and CI builds.

For individual packages within the monorepo, `lerna bootstrap` calls `npm ci` in
a CI environment or with `--ci` to install (deep) dependencies as specified in
`package-lock.json` file. Otherwise, `npm install` is run with the corresponding
`package.json`.

Top-level (`loopback-next`) dependencies are installed either from
`package-lock.json` (when you run `npm ci`), or resolved freshly from the npm
registry (when you run `npm install`).

**IMPORTANT: Dependencies resolved locally within the monorepo must be excluded
from package-lock files.**

### Updating package locks

If you ever end up with corrupted or out-of-date package locks, run the
following commands to fix the problem:

```sh
$ npm run update-package-locks
```

### Adding dependencies

Use the following command to add or update dependency `dep` in a package `name`:

```sh
$ npx lerna add --scope ${name} ${dep}
```

For example:

```sh
$ npx lerna add --scope @loopback/rest debug
```

See [lerna add](https://github.com/lerna/lerna/blob/master/commands/add#readme)
for more details.

**NOTE**: At the moment, `lerna` does not update `package-lock.json` files when
adding a dependency to a scope, see
[lerna#1989](https://github.com/lerna/lerna/issues/1989). You have to re-create
package locks manually, see [Updating package locks](#updating-package-locks)
above.

### Updating dependencies

To update dependencies to their latest compatible versions:

```sh
npm run update-all-deps
```

## File naming convention

For consistency, we follow
[Angular's file naming convention](https://angular.io/guide/styleguide#separate-file-names-with-dots-and-dashes).
It helps to derive the usage of files by inspecting the names. Besides the
LoopBack 4 codebase, we also follow this naming convention in our generated
artifacts from the CLI tooling: `{name}`.`{artifact-type}`.ts

Examples are:

```
src/decorators/authenticate.decorator.ts
src/boot.component.ts
```

In addition, files under `test` folder are categorized according to the type of
tests (unit, acceptance and integration), with the convention
`{name}.{test-type}.ts`.

Examples are:

```
src/__tests__/acceptance/application.acceptance.ts
src/__tests__/integration/user.controller.integration.ts
src/__tests__/unit/application.unit.ts
```

## API Documentation

We use
[@loopback/tsdocs](https://github.com/strongloop/loopback-next/tree/master/packages/tsdocs)
to generate API documentation for all our packages. This documentation is
generated when publishing new releases to npmjs.org and it's picked up by
https://loopback.io/doc/en/lb4/apidocs.index.html.

You can preview API docs locally by running `npm run tsdocs` and open
[apidocs/index.md](apidocs/index.md).

## Commit message guidelines

_Note: we have recently changed our commit message conventions. Most of other
LoopBack repositories (e.g.
[strongloop/loopback.io](https://github.com/strongloop/loopback.io)) use the
older convention as described on
[loopback.io](https://loopback.io/doc/en/contrib/git-commit-messages.html)._

A good commit message should describe what changed and why.

Our commit messages are formatted according to
[Conventional Commits](https://conventionalcommits.org/), we use
[commitlint](https://github.com/marionebl/commitlint) to verify and enforce this
convention. These rules lead to more readable messages that are easy to follow
when looking through the project history. But also, we use the git commit
messages to generate change logs when publishing new versions.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The
header has a special format that includes a **type**, an optional **scope** and
a **subject**:

```text
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

#### type

The **type** must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space,
  formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Changes to the auxiliary tools and libraries such as documentation
  generation
- **revert**: Reverts a previous commit

#### scope

The **scope** must be a list of one or more packages contained in this monorepo.
Each scope name must match a directory name in
[packages/](https://github.com/strongloop/loopback-next/tree/master/packages),
e.g. `core` or `context`.

_Note: If multiple packages are affected by a pull request, don't list the
scopes as the commit linter currently only supports only one scope being listed
at most. The `CHANGELOG` for each affected package will still show the commit.
Commit linter will be updated to allow listing of multiple affected scopes, see
[issue #581](https://github.com/strongloop/loopback-next/issues/581)_

#### subject

The **subject** contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

#### body

The **body** provides more details, it should include the motivation for the
change and contrast this with previous behavior.

Just as in the subject, use the imperative, present tense: "change" not
"changed" nor "changes"a

Paragraphs or bullet points are ok (must not exceed 100 characters per line).
Typically a hyphen or asterisk is used for the bullet, followed by a single
space, with blank lines in between.

#### footer (optional)

The **footer** should contain any information about Breaking Changes introduced
by this commit.

This section must start with the upper case text `BREAKING CHANGE` followed by a
colon (`:`) and a space (``). A description must be provided, describing what
has changed and how to migrate from older versions.

### Tools to help generate a commit message

This repository has [commitizen](https://github.com/commitizen/cz-cli) support
enabled. Commitizen can help you generate your commit messages automatically.
You must install it globally as follows:

```sh
npm i -g commitizen
```

And to use it, simply call `git cz` instead of `git commit`. The tool will help
you generate a commit message that follows the above guidelines.

## Making breaking changes

LoopBack is following [Semantic Versioning](https://semver.org). Any change
that's not fully backward compatible with previous versions has to increase the
major version number, e.g. `1.4.2 -> 2.0.0`.

In general, we try to avoid breaking backward compatibility too often and strive
to limit the frequency of major releases to about once or twice a year.

- Breaking changes make it difficult for our users to always stay at the latest
  version of the framework.
- Every additional major version we have to support adds extra maintenance
  overhead.
- In our
  [Long Term Support policy](https://loopback.io/doc/en/contrib/Long-term-support.html),
  we are committing to support every major module version for at least 12 months
  after it entered LTS mode and also support it for the entire LTS lifetime of
  the connected Node.js major version. If we release major versions too often,
  we can end up with a long list of versions we have to keep supporting for long
  time.

Whenever possible, consider implementing a feature flag that allows users to
decide when to migrate to the new behavior. Make this flag disabled by default
to preserve backward compatibility.

However, we do recognize that often a breaking change is the most sensible thing
to do. When that time comes:

- Describe incompatibilites for release notes
- Look for more breaking changes to include in the release
- Update list of supported versions

### Describe incompatibilites for release notes

In the pull request introducing the breaking change, provide a descriptive
[footer](#footer-optional) explaining the breaking change to our users. This
content will be used by release tooling to compile comprehensive release notes.

Put yourself in the shoes of module users and try to answer the following
questions:

- How can I find if my project is affected by this change?

- What does this change means for my project? What is going to change?

- How can I migrate my project to the new major version? What steps do I need to
  make?

### Look for more breaking changes

Look for other features or fixes that require a breaking change. Consider
grouping multiple backward incompatible changes into a single semver major
release.

Few examples of changes that are usually easy to make:

- Change the default value of a feature flag from "false" (backward-compatible
  behavior) to "true" (the new behavior).

- Deprecate a compatibility feature flag that's already enabled by default.

- Remove a deprecated feature flag.

- Drop support for a major version of Node.js that has already reached it's end
  of life or that will reach it soon (in the next 4-8 weeks).

### Update list of supported versions

Make sure the package's README has an up-to-date section about the supported
versions. Read our
[Long Term Support policy](https://loopback.io/doc/en/contrib/Long-term-support.html)
to understand the rules governing transition between different support levels.

- There should be at most one version in Active LTS mode. This version moves to
  Maintenance LTS.

- The version listed as Current is entering Active LTS mode.

- The new major version is becoming Current.

It is important to make these updates _before_ publishing the new major version,
so that new content is included on the package page provided by
[npmjs.com](https://www.npmjs.com/).

## Releasing new versions

When we are ready to tag and publish a release, run the following commands:

```sh
cd loopback-next
git checkout master
git pull
npm run release
```

The `release` script will automatically perform the tasks for all packages:

- Clean up `node_modules`
- Install/link dependencies
- Transpile TypeScript files into JavaScript
- Run mocha tests
- Check lint (eslint and prettier) issues

If all steps are successful, it prompts you to publish packages into npm
repository.

## Adding a new package

### Create a new package

To add a new package, create a folder in
[`packages`](https://github.com/strongloop/loopback-next/tree/master/packages)
as the root directory of your module. For example,

```sh
cd loopback-next/packages
mkdir <a-new-package>
```

The package follows the node/npm module layout. You can use `npm init` or
`lb4 extension` command to scaffold the module, copy/paste from an existing
package, or manually add files including `package.json`.

Make sure you add LICENSE file properly and all source code files have the
correct copyright header.

### Keep shared configuration in root

We have some configuration files at the top level (**loopback-next/**):

- `.gitignore`
- `.prettierignore`
- `.nycrc.yml`

For consistency across all packages, do not add them at package level unless
specific customization is needed.

### Make a scoped package public

By default, npm publishes scoped packages with private access. There are two
options to make a new scoped package with public access.

Either add the following section to `package.json`:

```json
  "publishConfig": {
    "access": "public"
  },
```

Or explicitly publish the package with `--access=public`:

```sh
cd packages/<a-new-package>
npm publish --access=public
```

### Register the new package

Please register the new package in the following files:

- Update [MONOREPO.md](./MONOREPO.md) - insert a new table row to describe the
  new package, please keep the rows sorted by package name.
- Update [Reserved-binding-keys.md](./Reserved-binding-keys.md) - add a link to
  the apidocs on Binding Keys if the new package has any.
- Update
  [CODEOWNERS](https://github.com/strongloop/loopback-next/blob/master/CODEOWNERS) -
  add a new entry listing the primary maintainers (owners) of the new package.

## Upgrading TypeScript/eslint

In order to support eslint extensions with a peer dependency on eslint, we have
to specify `typescript` and `eslint` dependency in multiple places in our
monorepo.

Steps to upgrade `typescript` or `eslint` to a newer version:

1. Update the dependencies in `@loopback/build`, this is the source of truth for
   the rest of the monorepo.

   ```shell
   $ (cd packages/build && npm update typescript eslint)
   ```

2. Propagate the change to other places to keep everything consistent.

   ```shell
   $ node bin/sync-dev-deps
   ```

## How to test infrastructure changes

When making changes to project infrastructure, e.g. modifying `tsc` or `eslint`
configuration, it's important to verify that all usage scenarios keep working.

### Verify TypeScript setup

1.  Open any existing TypeScript file, e.g. `packages/core/src/index.ts`

2.  Add a small bit of code to break TypeScript's type checks, for example:

    ```ts
    const foo: number = 'bar';
    ```

3.  Run `npm test`

4.  Verify that the build failed and the compiler error message shows a path
    relative to monorepo root, e.g. `packages/src/index.ts`.

5.  Test integration with supported IDEs:
    - [VS Code](./VSCODE.md#how-to-verify-typescript-setup)

### Verify ESLint setup

1.  Open any existing TypeScript file, e.g. `packages/src/index.ts`

2.  Introduce two kinds linting problems - one that does and another that does
    not require type information to be detected. For example, you can add the
    following line at the end of the opened `index.ts`:

    ```ts
    const foo: any = 'bar';
    ```

3.  Run `npm test`

4.  Verify that the build failed and both linting problems are reported:

    ```text
    ERROR: /Users/(...)/packages/core/src/index.ts[16, 7]: 'foo' is declared but its value is never read.
    ERROR: /Users/(...)/packages/core/src/index.ts[16, 12]: Type declaration of 'any' loses type-safety. Consider replacing it with a more precise type.
    ```

5.  Test integration with supported IDEs:

    - [VS Code](./VSCODE.md#how-to-verify-eslint-setup)

### tsconfig files

In the [`loopback-next`](https://github.com/strongloop/loopback-next) monorepo,
`TypeScript` is set up in two places:

1. When using VS Code, the `TypeScript` engine views `loopback-next` as a single
   big project.

   This enables the "refactor - rename" command to change all places using the
   renamed symbol, and also makes "go to definition" command jump to `.ts` files
   containing the original source code. Otherwise "refactor - rename" works
   within the same package only and "go to definition" jumps to `.d.ts` files.

2. When building the monorepo, we need to build the packages individually, so
   that one `dist` directory is created for each package.

This is why we have two sets of `tsconfig` files:

- At monorepo root, there is `tsconfig.json` used by VS Code.
- Inside each package, there is `tsconfig.build.json` used by `npm run build`
  command.

## Renovate bot

In loopback-next, we use package-lock files to speed up `npm install` times and
[Renovate bot](http://renovatebot.com) to keep our lock files up to date.

The bot is configured to maintain a special issue called
`Update Dependencies (Renovate Bot)` where it lists all pull requests in
progress and in queue:

- [loopback-next#3042](https://github.com/strongloop/loopback-next/issues/3042)
- [loopback4-example-shopping#94](https://github.com/strongloop/loopback4-example-shopping/issues/94)

Pull requests opened by RenovateBot can be merged by pressing GitHub's big green
button once all checks are green (all CI builds finished).

RenovateBot periodically checks for changes on `master` and rebases pull request
in progress when new commits were added. If GitHub complains that RenovateBot's
pull request is out of date, then just wait until it's rebased and checks are
green. The bot usually updates pull requests every hour. Alternatively, tick the
check-box in the pull request description or in "Update Dependencies" issue.
