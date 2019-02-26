# Developing with VisualStudio Code

We recommend our contributors to use
[VisualStudio Code](https://code.visualstudio.com/) with the following
extensions installed:

- [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  for automatic formatting of source files on save.
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  to highlight and auto-fix linting problems directly in the editor.

Our monorepo comes with few preconfigured
[VSCode Tasks](https://code.visualstudio.com/docs/editor/tasks):

- The build task is configured to run the TypeScript compiler
- The test task is configured to run `npm test` (which runs the build before
  running any tests).

## How to verify TypeScript setup

### Compilation errors

1.  Open any existing TypeScript file, e.g. `packages/core/src/index.ts`

2.  Add a small bit of code to break TypeScript's type checks, for example:

    ```ts
    const foo: number = 'bar';
    ```

3.  Verify that VS Code editor has marked `foo` with a red underscore. Hover
    over `foo` and check the problem message. It should mention `[ts]` source,
    e.g.

    ```text
    [ts] Type '"bar"' is not assignable to type 'number'.
    ```

4.  Check VS Code's
    [PROBLEMS Window](https://code.visualstudio.com/docs/getstarted/tips-and-tricks#_errors-and-warnings).
    There should be an entry showing the same eslint error. When you click on
    the entry, it should jump on the problematic line.

5.  Close the editor tab. (This will clear the PROBLEMS entry reported by ESLint
    extension).

6.  Run the test task ("Tasks: Run test task"). This will invoke package scripts
    like `npm test` under the hood.

7.  Open "Tasks" OUTPUT window and verify that compilation error was parsed by
    VSCode.

8.  Verify that compilation errors are correctly associated with the problematic
    source code line.

### Navigation in VS Code

Verify that "Go to definition" works across package boundaries. Find a place
where we are calling `@inject` in `authentication` package, press F12 to go to
the definition of `inject`. VSCode should jump to the `.ts` file in `src` (as
opposed to jumping to a `.d.ts` file in `dist`)

#### Refactoring in VS Code

Verify that refactorings like "rename symbol" (`F2`) will change all places
using the renamed entity. Two different scenarios to verify: rename at the place
where the entity is defined, rename at the place where the entity is used. (You
can e.g. rename `inject` to test.)

## How to verify ESLint setup

1.  Open any existing TypeScript file, e.g. `packages/src/index.ts`

2.  Verify that ESLint extension is not reporting any warnings in the output
    window:

    - pres _Cmd+shift+P_ or _Ctrl+shift+P_ to open task selector
    - find and run the task `ESLint: Show Output`
    - check the logs

    An example of a warning we want to **avoid**:

    ```text
    Warning: The 'no-unused-variable' rule requires type information.
    ```

3.  Introduce two kinds linting problems - one that does and another that does
    not require type information to be detected. For example, you can add the
    following line at the end of the opened `index.ts`:

    ```ts
    const foo: any = 'bar';
    ```

4.  Verify that VS Code editor has marked `any` with a red underscore. Hover
    over `any` and check the problem message. It should mention `no-any` rule,
    e.g.

    ```text
    [eslint] Type declaration of 'any' loses type-safety. Consider replacing it with a more precise type. (no-any)
    ```

5.  Check VS Code's
    [PROBLEMS Window](https://code.visualstudio.com/docs/getstarted/tips-and-tricks#_errors-and-warnings).
    There should be an entry showing the same eslint error. When you click on
    the entry, it should jump on the problematic line.

6.  Close the editor tab. (This will clear the PROBLEMS entry reported by ESLint
    extension).

7.  Run the test task ("Tasks: Run test task"). This will invoke package scripts
    like `npm test` under the hood.

8.  Open "Tasks" OUTPUT window and verify that two eslint problems were
    reported:

    ```text
    ERROR: /Users/(...)/packages/core/src/index.ts[16, 7]: 'foo' is declared but its value is never read.
    ERROR: /Users/(...)/packages/core/src/index.ts[16, 12]: Type declaration of 'any' loses type-safety. Consider replacing it with a more precise type.
    ```

9.  Open "PROBLEMS" window again. Verify that both problems were parsed by VS
    Code and are correctly associated with the problematic source code line.
