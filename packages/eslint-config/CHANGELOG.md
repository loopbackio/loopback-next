# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [10.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@10.1.0...@loopback/eslint-config@10.1.1) (2021-04-06)

**Note:** Version bump only for package @loopback/eslint-config





# [10.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@10.0.5...@loopback/eslint-config@10.1.0) (2021-03-18)


### Bug Fixes

* no need to import prettier extensions anymore ([0b13d35](https://github.com/strongloop/loopback-next/commit/0b13d353a3055414e691176cd83c908a78afcc05))


### Features

* update package-lock.json to v2 consistently ([dfc3fbd](https://github.com/strongloop/loopback-next/commit/dfc3fbdae0c9ca9f34c64154a471bef22d5ac6b7))
* upgrade to TypeScript 4.2.x ([05930bc](https://github.com/strongloop/loopback-next/commit/05930bc0cece3909dd66f75ad91eeaa2d365a480))





## [10.0.5](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@10.0.4...@loopback/eslint-config@10.0.5) (2021-01-21)

**Note:** Version bump only for package @loopback/eslint-config





## [10.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@10.0.3...@loopback/eslint-config@10.0.4) (2020-12-07)

**Note:** Version bump only for package @loopback/eslint-config





## [10.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@10.0.2...@loopback/eslint-config@10.0.3) (2020-11-18)

**Note:** Version bump only for package @loopback/eslint-config





## [10.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@10.0.1...@loopback/eslint-config@10.0.2) (2020-11-05)

**Note:** Version bump only for package @loopback/eslint-config





## [10.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@10.0.0...@loopback/eslint-config@10.0.1) (2020-10-07)

**Note:** Version bump only for package @loopback/eslint-config





# [10.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@9.0.2...@loopback/eslint-config@10.0.0) (2020-09-15)


### Features

* **eslint-config:** update rules to be compatible with typescript-eslint 4.x ([595951c](https://github.com/strongloop/loopback-next/commit/595951cab99af82a1d41623ad37c133b3e6d8c5a))
* update typescript-eslint monorepo to v4 ([5767e22](https://github.com/strongloop/loopback-next/commit/5767e22eaf9813ea619f21710bddf12ac7303705))


### BREAKING CHANGES

* **eslint-config:** typescript-eslint 4.x introduces some breaking changes.
The following are impacted:

- decorator functions are correctly honored as usage of defined variables
- @typescript-eslint/no-shadow replaces no-shadow

Signed-off-by: Raymond Feng <enjoyjava@gmail.com>





## [9.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@9.0.1...@loopback/eslint-config@9.0.2) (2020-08-27)

**Note:** Version bump only for package @loopback/eslint-config





## [9.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@9.0.0...@loopback/eslint-config@9.0.1) (2020-08-19)

**Note:** Version bump only for package @loopback/eslint-config





# [9.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@8.0.4...@loopback/eslint-config@9.0.0) (2020-08-05)


### Features

* **eslint-config:** disable `createDefaultProgram` ([13dbaf2](https://github.com/strongloop/loopback-next/commit/13dbaf24abad16ac4249cef15f41508d5264ed54))


### BREAKING CHANGES

* **eslint-config:** We are no longer telling eslint to create a default
program for files not included in `tsconfig.json`. If you start
receiving linter errors after upgrade, you can either add
`createDefaultProgram` to your eslint config manually, modify your
`tsconfig` file to include all files checked by eslint, or exclude
the problematic files from linting by adding them to `.eslintignore`
file.

In projects scaffolded via `lb4 app`, we recommend to add `.eslintrc.js`
file to `.eslintignore` list.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [8.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@8.0.3...@loopback/eslint-config@8.0.4) (2020-07-20)

**Note:** Version bump only for package @loopback/eslint-config





## [8.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@8.0.2...@loopback/eslint-config@8.0.3) (2020-06-30)

**Note:** Version bump only for package @loopback/eslint-config





## [8.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@8.0.1...@loopback/eslint-config@8.0.2) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [8.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@8.0.0...@loopback/eslint-config@8.0.1) (2020-06-11)

**Note:** Version bump only for package @loopback/eslint-config





# [8.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@7.0.1...@loopback/eslint-config@8.0.0) (2020-05-28)


### Features

* **eslint-config:** add naming convention rules ([c8e2143](https://github.com/strongloop/loopback-next/commit/c8e214392a572a81620133f79c2cc122f89e6862))
* **eslint-config:** disable 'warning Missing return type on function' for now ([1b3494e](https://github.com/strongloop/loopback-next/commit/1b3494e721e1eed782f07ab38748662d850391f0))


### BREAKING CHANGES

* **eslint-config:** @typescript-eslint/typescript-eslint v3.0.0 introduces
a list of breaking changes. Existing code might violate the new or changed
rules. Manual fixes may be required.

See more details at:
https://github.com/typescript-eslint/typescript-eslint/releases/tag/v3.0.0





## [7.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@7.0.0...@loopback/eslint-config@7.0.1) (2020-05-20)

**Note:** Version bump only for package @loopback/eslint-config





# [7.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@6.0.6...@loopback/eslint-config@7.0.0) (2020-05-19)


### Features

* replace eslint rule `no-invalid-this` with TypeScript-aware one ([b2f21f7](https://github.com/strongloop/loopback-next/commit/b2f21f78c28c71b59bbed8f1a42c4b663c85f507))
* **eslint-config:** upgrade to ESLint 7.x ([5c3e3c2](https://github.com/strongloop/loopback-next/commit/5c3e3c247b9d6f47a1b5d861ffe3eff35ed5caf0))


### BREAKING CHANGES

* In code accessing `this` variable, eslint-ignore
comment for `no-invalid-this` will no longer work. You can either
change those comments to disable `@typescript-eslint/no-invalid-this`,
or better tell TypeScript what is the type of `this` in your function.

A TypeScript example:

```ts
describe('my mocha suite', function(this: Mocha.Suite) {
  this.timeout(1000);
  it('is slow', function(this: Mocha.Context) {
    this.timeout(2000);
  });
})
```

A JavaScript example:

```js
describe('my mocha suite', /** @this {Mocha.Suite} */ function() {
  this.timeout(1000);
  it('is slow', /** @this {Mocha.Context} */ function() {
    this.timeout(2000);
  });
})
```

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>
* **eslint-config:** ESLint 7.x changes how plugins references in the shared
config are resolved. The following is quoted from
https://eslint.org/blog/2020/05/eslint-v7.0.0-released:

> ESLint will now resolve plugins relative to the entry configuration file.
This means that shared configuration files that are located outside the
project can now be colocated with the plugins they require.
> Starting in ESLint v7, configuration files and ignore files passed to
ESLint using the --config path/to/a-config and --ignore-path
path/to/a-ignore CLI flags, respectively, will resolve from the current
working directory rather than the file location. This allows for users to
utilize shared plugins without having to install them directly in their
project.





## [6.0.6](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@6.0.5...@loopback/eslint-config@6.0.6) (2020-05-07)

**Note:** Version bump only for package @loopback/eslint-config





## [6.0.5](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@6.0.4...@loopback/eslint-config@6.0.5) (2020-04-29)

**Note:** Version bump only for package @loopback/eslint-config





## [6.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@6.0.3...@loopback/eslint-config@6.0.4) (2020-04-22)

**Note:** Version bump only for package @loopback/eslint-config





## [6.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@6.0.2...@loopback/eslint-config@6.0.3) (2020-04-08)

**Note:** Version bump only for package @loopback/eslint-config





## [6.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@6.0.1...@loopback/eslint-config@6.0.2) (2020-03-24)

**Note:** Version bump only for package @loopback/eslint-config





## [6.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@6.0.0...@loopback/eslint-config@6.0.1) (2020-03-17)

**Note:** Version bump only for package @loopback/eslint-config





# [6.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@5.0.3...@loopback/eslint-config@6.0.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* **eslint-config:** disallow non-null assertions after optional chain ([6fdc2b5](https://github.com/strongloop/loopback-next/commit/6fdc2b524b72a2cca08307e5d1a66c360c3ceb5a)), closes [#4675](https://github.com/strongloop/loopback-next/issues/4675)


### BREAKING CHANGES

* **eslint-config:** eslint rule
`@typescript-eslint/no-non-null-asserted-optional-chain` is set to
`error` which may break existing lint tests.
* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [5.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@5.0.2...@loopback/eslint-config@5.0.3) (2020-02-05)

**Note:** Version bump only for package @loopback/eslint-config





## [5.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@5.0.1...@loopback/eslint-config@5.0.2) (2020-01-27)

**Note:** Version bump only for package @loopback/eslint-config





## [5.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@5.0.0...@loopback/eslint-config@5.0.1) (2020-01-07)

**Note:** Version bump only for package @loopback/eslint-config





# [5.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.1.5...@loopback/eslint-config@5.0.0) (2019-12-09)


### Features

* **eslint-config:** add @typescript-eslint/prefer-nullish-coalescing rule ([b608120](https://github.com/strongloop/loopback-next/commit/b608120dbf67e1f93eabd6fa5efe1f6e6630084a))
* **eslint-config:** add typescript-eslint/prefer-optional-chain rule ([bd1252a](https://github.com/strongloop/loopback-next/commit/bd1252a4367db8212f8b48c06fcc7434a2456b12))
* **eslint-config:** enable no-extra-non-null-assertion ([d74a688](https://github.com/strongloop/loopback-next/commit/d74a68889fb48d7a1cb7034cb5a8fa8587853b5e))
* **eslint-config:** enable return-await ([be6b38b](https://github.com/strongloop/loopback-next/commit/be6b38b75b2f4c937b742398c9edcbb6c2d1d7c0))


### BREAKING CHANGES

* **eslint-config:** The linter will reject code using `return await`
ouside of `try` blocks or forgetting to `await` before returning
from inside a `try` block.
Migration guide: use `return` outside of `try` blocks and `return await`
inside `try` blocks.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>
* **eslint-config:** the `@typescript-eslint/prefer-nullish-coalescing` rule prefers
nullish coalescing, for example, `ttl ?? 5000` over `ttl || 5000`.

See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing
* **eslint-config:** the `@typescript-eslint/prefer-optional-chain` rule will
report violations if optional chaining is not used. For example, it prefers
`options?.ttl` over `options && options.ttl`.

See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#optional-chaining





## [4.1.5](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.1.4...@loopback/eslint-config@4.1.5) (2019-11-25)

**Note:** Version bump only for package @loopback/eslint-config





## [4.1.4](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.1.3...@loopback/eslint-config@4.1.4) (2019-11-12)

**Note:** Version bump only for package @loopback/eslint-config





## [4.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.1.2...@loopback/eslint-config@4.1.3) (2019-10-24)

**Note:** Version bump only for package @loopback/eslint-config





## [4.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.1.1...@loopback/eslint-config@4.1.2) (2019-10-07)

**Note:** Version bump only for package @loopback/eslint-config





## [4.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.1.0...@loopback/eslint-config@4.1.1) (2019-09-27)

**Note:** Version bump only for package @loopback/eslint-config





# [4.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.0.2...@loopback/eslint-config@4.1.0) (2019-09-17)


### Features

* **eslint-config:** enable "no-misused-promises" rule ([88d5494](https://github.com/strongloop/loopback-next/commit/88d5494))





## [4.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.0.1...@loopback/eslint-config@4.0.2) (2019-09-03)

**Note:** Version bump only for package @loopback/eslint-config





## [4.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.0.0...@loopback/eslint-config@4.0.1) (2019-08-19)

**Note:** Version bump only for package @loopback/eslint-config





# [4.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@3.0.0...@loopback/eslint-config@4.0.0) (2019-08-15)


### Features

* **eslint-config:** upgrade to @typescript-eslint/eslint-plugin 2.0.0 ([1ec5b2f](https://github.com/strongloop/loopback-next/commit/1ec5b2f))


### BREAKING CHANGES

* **eslint-config:** @typescript-eslint/parser and @typescript-eslint/eslint-plugin
2.0.0 may have introduced breaking changes for recommended rules and configuration





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@2.0.2...@loopback/eslint-config@3.0.0) (2019-07-31)


### Features

* **eslint-config:** enable "no-return-await" rule ([e28a3c3](https://github.com/strongloop/loopback-next/commit/e28a3c3))


### BREAKING CHANGES

* **eslint-config:** "return await" is no longer allowed, just return the
promise without awaiting its resolution.





## [2.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@2.0.1...@loopback/eslint-config@2.0.2) (2019-07-26)

**Note:** Version bump only for package @loopback/eslint-config





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@2.0.0...@loopback/eslint-config@2.0.1) (2019-07-17)

**Note:** Version bump only for package @loopback/eslint-config





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.1.2...@loopback/eslint-config@2.0.0) (2019-06-28)


### Features

* **eslint-config:** enable "no-floating-promises" rule ([256e3e8](https://github.com/strongloop/loopback-next/commit/256e3e8))
* **eslint-config:** upgrade eslint to v6 ([b52a40c](https://github.com/strongloop/loopback-next/commit/b52a40c))


### BREAKING CHANGES

* **eslint-config:** We require eslint version 6.0 as a peer dependency now.
To upgrade your project using our eslint-config, bump up eslint version
in your package.json file to "^6.0.0".

The new eslint version added new recommended rules, most notably
"require-atomic-updates" and "no-prototype-builtins". You may get new
linting errors after upgrade, fix them by changing your code or adding
eslint-ignore comments as needed.





## [1.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.1.1...@loopback/eslint-config@1.1.2) (2019-06-17)

**Note:** Version bump only for package @loopback/eslint-config





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.1.0...@loopback/eslint-config@1.1.1) (2019-06-06)

**Note:** Version bump only for package @loopback/eslint-config





# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.0.0-3...@loopback/eslint-config@1.1.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))
* **eslint-config:** allow detection of tsconfig file ([5c16db6](https://github.com/strongloop/loopback-next/commit/5c16db6))





# [1.0.0-3](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.0.0-2...@loopback/eslint-config@1.0.0-3) (2019-05-31)

**Note:** Version bump only for package @loopback/eslint-config





# 1.0.0-2 (2019-05-30)


### Features

* **build:** add eslint scripts and default configs ([a6abe86](https://github.com/strongloop/loopback-next/commit/a6abe86))
