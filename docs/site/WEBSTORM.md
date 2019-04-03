# Developing with Webstorm

For contributors using [WebStorm](https://www.jetbrains.com/webstorm/) as their
preferred development environment, we recommend the following extensions to be
installed:

- [Prettier - Code Formatter](https://prettier.io/docs/en/webstorm.html) for
  automatic formatting of source files on save.

We also recommend our contributors to enable
[TSLint](https://www.jetbrains.com/help/webstorm/2018.2/tslint.html) in WebStorm
to highlight and auto-fix linting problems directly in the editor. Make sure you
are using the TSLint package from loopback-next
`loopback-next/packages/build/node_modules/tslint`.

Please note that you should at least use WebStorm `2018.3` to avoid
[an indexing issue](https://youtrack.jetbrains.com/issue/WEB-34416).

## How to verify TypeScript setup

### Compilation errors

1.  Open any existing TypeScript file, e.g. `packages/src/index.ts`

2.  Add a small bit of code to break TypeScript's type checks, for example:

    ```ts
    const foo: number = 'bar';
    ```

3.  Verify that WebStorm editor has marked `foo` with a red underscore. Hover
    over `foo` and check the problem message. It should start with `TS` prefix
    followed by a message, e.g.

    ```text
    TS2322: Type '"bar"' is not assignable to type 'number'.
    ```

4.  Check WebStorm
    [Typescript Window](https://www.jetbrains.com/help/webstorm/2018.2/typescript-compiler-tool-window.html?search=typescript).
    There should be an entry showing the same error. When you click on the
    entry, it should jump on the problematic line.

### Navigation in WebStorm

Verify that "Go to declaration" works across package boundaries. Find a place
where we are calling `@inject` in `authentication` package, press `Ctrl+B` to go
to the declaration of `inject`. WebStorm should jump to the `.ts` file in `src`
(as opposed to jumping to a `.d.ts` file in `dist`)

#### Refactoring in WebStorm

It seems that refactorings like "rename" with (`Maj+F6`) will not change the
renamed entity across packages.

## How to verify TSLint setup

1.  Open any existing TypeScript file, e.g. `packages/src/index.ts`

2.  Verify that TSLint is not reporting any warnings : An example of a warning
    we want to **avoid**:

    ```text
    Warning: The 'no-unused-variable' rule requires type information.
    ```

3.  Introduce two kinds linting problems - one that does and another that does
    not require type information to be detected. For example, you can add the
    following line at the end of the opened `index.ts`:

    ```ts
    const foo: any = 'bar';
    ```

4.  Verify that WebStorm editor has marked `any` with a red underscore. Hover
    over `any` and check the problem message. It should mention `no-any` rule,
    e.g.

    ```text
    TSLint: Type declaration of 'any' loses type-safety. Consider replacing it with a more precise type. (no-any)
    ```
