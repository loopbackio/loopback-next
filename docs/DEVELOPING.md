# Developing LoopBack

This document describes how to develop modules living in loopback-next monorepo. See [Monorepo overview](../MONOREPO.md) for a list of all packages.

 - [Setting up development environment](#setting-up-development-environment)
 - [Building the project](#building-the-project)
 - [Running tests](#running-tests)
 - [Coding rules](#coding-rules)
 - [API documentation](#api-documentation)
 - [Commit message guidelines](#commit-message-guidelines)
 - [Releasing new versions](#releasing-new-versions)
 - [How to test infrastructure changes](#how-to-test-infrastructure-changes)

## Setting up development environment

Before you can start developing LoopBack, you need to install and configure few
dependencies.

 - [git](https://git-scm.com/): Github's [Set Up Git](https://help.github.com/articles/set-up-git/) guide is a good source of information.
 - [Node.js 8.x (LTS)](https://nodejs.org/en/download/)

You may want to configure your IDE or editor to get better support for
TypeScript too.

 - [VisualStudio Code](./VSCODE.md)
 - _Missing your favorite IDE/editor here? We would love to have documentation for more IDEs/editors! Please send a pull request to add recommended setup for your tool._

Before getting started, it is recommended to configure `git` so that it knows who you are:

```sh
$ git config --global user.name "J. Random User"
$ git config --global user.email "j.random.user@example.com"
```

Please make sure this local email is also added to your [GitHub email list](https://github.com/settings/emails) so that your commits will be properly associated with your account and you will be promoted to Contributor once your first commit is landed.

## Building the project

Whenever you pull updates from GitHub or switch between feature branches, make sure to updated installed dependencies in all monorepo packages. The following command will install npm dependencies for all packages and create symbolic links for intra-dependencies:

```sh
$ npm run bootstrap
```

The next step is to compile all packages from TypeScript to JavaScript:

```sh
$ npm run build
```

Please note that we are automatically running the build from `pretest`
script, therefore you should not need to run this command as part of your
[red-green-refactor cycle](http://www.jamesshore.com/Blog/Red-Green-Refactor.html).

## Running tests

This is the only command you should need while developing LoopBack:

```sh
$ npm test
```

It does all you need:

 - Compile TypeScript
 - Run all tests
 - Check code formatting using [Prettier](https://prettier.io/)
 - Lint the code using [TSLint](https://palantir.github.io/tslint/)

## Coding rules

- All features and bug fixes must be covered by one or more automated tests.

- All public methods must be documented with typedoc comments (see [API Documentation](#api-documentation) below).

- Follow our style guide as documented on loopback.io: [Code style guide](http://loopback.io/doc/en/contrib/style-guide.html).

### Linting and formatting

We use two tools to help keep our codebase healthy:

 - [TSLint](https://palantir.github.io/tslint/) to statically analyse our source code and detect common problems.
 - [Prettier](https://prettier.io/) to keep our code always formatted the same way, avoid style discussions in code reviews, and save everybody's time an energy.

You can run both linters via the following npm script, just keep in mind that `npm test` is already running them for you.

```sh
$ npm run lint
```

Many problems (especially formatting) can be automatically fixed by running the npm script `lint:fix`.

```sh
$ npm run lint:fix
```

## API Documentation

We use [strong-docs](https://github.com/strongloop/strong-docs) to generate API documentation for all our packages. This documentation is generated when publishing new releases to npmjs.org and it's picked up by http://apidocs.loopback.io/.

You can preview API docs locally by opening the file `docs/apidocs.html` in your browser.

## Commit message guidelines

_Note: we have recently changed our commit message conventions. Most of other LoopBack repositories (e.g. [strongloop/loopback.io](https://github.com/strongloop/loopback.io)) use the older convention as described on [loopback.io](https://loopback.io/doc/en/contrib/git-commit-messages.html)._

A good commit message should describe what changed and why.

Our commit messages are formatted according to [Conventional Commits](https://conventionalcommits.org/), we use [commitlint](https://github.com/marionebl/commitlint) to verify and enforce this convention.  These rules lead to more readable messages that are easy to follow when looking through the project history. But also, we use the git commit messages to generate change logs when publishing new versions.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, an optional **scope** and a **subject**:

```
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
 - **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
 - **refactor**: A code change that neither fixes a bug nor adds a feature
 - **perf**: A code change that improves performance
 - **test**: Adding missing or correcting existing tests
 - **build**: Changes that affect the build system or external dependencies
 - **ci**: Changes to our CI configuration files and scripts
 - **chore**: Changes to the auxiliary tools and libraries such as documentation generation
 - **revert**: Reverts a previous commit

#### scope

The **scope** must be a list of one or more packages contained in this monorepo. Each scope name must match a directory name in [packages/](../packages), e.g. `core` or `context`.


#### subject

The **subject** contains succinct description of the change:

 - use the imperative, present tense: "change" not "changed" nor "changes"
 - don't capitalize first letter
 - no dot (.) at the end

#### body

The **body** provides more details, it should include the motivation for the change and contrast this with previous behavior.

Just as in the subject, use the imperative, present tense: "change" not "changed" nor "changes"a

#### footer (optional)

The **footer** should contain any information about Breaking Changes introduced by this commit.

This section must start with the upper case text `BREAKING CHANGE` followed by a colon (`:`) and a space (` `). A description must be provided, describing what has changed and how to migrate from older versions.

## Releasing new versions

When we are ready to tag and publish a release, run the following commands:

```sh
$ cd loopback-next
$ git checkout master
$ git pull
$ npm run release
```

The `release` script will automatically perform the tasks for all packages:

- Clean up `node_modules`
- Install/link dependencies
- Transpile TypeScript files into JavaScript
- Run mocha tests
- Check lint (tslint and prettier) issues

If all steps are successful, it prompts you to publish packages into npm repository.

## How to test infrastructure changes

When making changes to project infrastructure, e.g. modifying `tsc` or `tslint`
configuration, it's important to verify that all usage scenarios keep working.

### Verify TypeScript setup

1. Open any existing TypeScript file, e.g. `packages/src/index.ts`

2. Add a small bit of code to break TypeScript's type checks, for example:

    ```ts
    const foo: number = 'bar';
    ```

3. Run `npm test`

4. Verify that the build failed and the compiler error message shows a path
   relative to monorepo root, e.g. `packages/src/index.ts`.

   _(This is does not work now, `tsc` is reporting paths relative to individual package directories. See https://github.com/strongloop/loopback-next/issues/1010)_

5. Test integration with supported IDEs:
    - [VS Code](./VSCode.md#how-to-verify-typescript-setup)

### Verify TSLint setup

1. Open any existing TypeScript file, e.g. `packages/src/index.ts`

2. Introduce two kinds linting problems - one that does and another that does not require type information to be detected. For example, you can add the following line at the end of the opened `index.ts`:

    ```ts
    const foo: any = 'bar';
    ```

3. Run `npm test`

4. Verify that the build failed and both linting problems are reported:

    ```text
    ERROR: /Users/(...)/packages/core/src/index.ts[16, 7]: 'foo' is declared but its value is never read.
    ERROR: /Users/(...)/packages/core/src/index.ts[16, 12]: Type declaration of 'any' loses type-safety. Consider replacing it with a more precise type.
    ```

5. Test integration with supported IDEs:

    - [VS Code](./VSCode.md#how-to-verify-tslint-setup)

