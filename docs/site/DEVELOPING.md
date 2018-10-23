# Developing LoopBack

This document describes how to develop modules living in loopback-next monorepo.
See [Monorepo overview](./MONOREPO.md) for a list of all packages.

- [Setting up development environment](#setting-up-development-environment)
- [Building the project](#building-the-project)
- [Running tests](#running-tests)
- [Coding rules](#coding-rules)
- [File naming convention](#file-naming-convention)
- [API documentation](#api-documentation)
- [Commit message guidelines](#commit-message-guidelines)
- [Releasing new versions](#releasing-new-versions)
- [Adding a new package](#adding-a-new-package)
- [How to test infrastructure changes](#how-to-test-infrastructure-changes)

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
npm install
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
- Lint the code using [TSLint](https://palantir.github.io/tslint/)

## Coding rules

- All features and bug fixes must be covered by one or more automated tests.

- All public methods must be documented with typedoc comments (see
  [API Documentation](#api-documentation) below).

- Follow our style guide as documented on loopback.io:
  [Code style guide](http://loopback.io/doc/en/contrib/style-guide.html).

### Linting and formatting

We use two tools to keep our codebase healthy:

- [TSLint](https://palantir.github.io/tslint/) to statically analyse our source
  code and detect common problems.
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
test/acceptance/application.acceptance.ts
test/integration/user.controller.integration.ts
test/unit/application.unit.ts
```

## API Documentation

We use [@loopback/tsdocs](https://github.com/strongloop/@loopback/tsdocs) to
generate API documentation for all our packages. This documentation is generated
when publishing new releases to npmjs.org and it's picked up by
<http://apidocs.loopback.io/>.

You can preview API docs locally by opening the file `docs/apidocs.html` in your
browser.

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
Each scope name must match a directory name in [packages/](../packages), e.g.
`core` or `context`.

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
- Check lint (tslint and prettier) issues

If all steps are successful, it prompts you to publish packages into npm
repository.

## Adding a new package

### Create a new package

To add a new package, create a folder in [`packages`](packages) as the root
directory of your module. For example,

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
- Update [docs/apidocs.html](../apidocs.html) - add a link to API docs for this
  new package.
- Update [Reserved-binding-keys.md](./Reserved-binding-keys.mds) - add a link to
  the apidocs on Binding Keys if the new package has any.
- Update [CODEOWNERS](../../CODEOWNERS) - add a new entry listing the primary
  maintainers (owners) of the new package.
- Ask somebody from the IBM team (e.g. [@bajtos](https://github.com/bajtos) or
  [@raymondfeng](https://github.com/raymondfeng) to enlist the new package on
  <http://apidocs.loopback.io/>.

## How to test infrastructure changes

When making changes to project infrastructure, e.g. modifying `tsc` or `tslint`
configuration, it's important to verify that all usage scenarios keep working.

### Verify TypeScript setup

1.  Open any existing TypeScript file, e.g. `packages/src/index.ts`

2.  Add a small bit of code to break TypeScript's type checks, for example:

    ```ts
    const foo: number = 'bar';
    ```

3.  Run `npm test`

4.  Verify that the build failed and the compiler error message shows a path
    relative to monorepo root, e.g. `packages/src/index.ts`.

    _(This is does not work now, `tsc` is reporting paths relative to individual
    package directories. See
    <https://github.com/strongloop/loopback-next/issues/1010>)_

5.  Test integration with supported IDEs:
    - [VS Code](./VSCode.md#how-to-verify-typescript-setup)

### Verify TSLint setup

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

    - [VS Code](./VSCode.md#how-to-verify-tslint-setup)
