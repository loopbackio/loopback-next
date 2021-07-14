---
lang: en
title: 'Debugging tests with Mocha'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, Debug
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Debugging-tests-with-mocha.html
---

### Running Specific Tests

To run a single test case or test suite, you can use the `only` method as
`describe.only()` or `it.only()`. And inversely, you can skip tests by using
`describe.skip()` or `it.skip()`. The usage is well documented in
[mocha exclusive tests](https://mochajs.org/#exclusive-tests) and
[mocha inclusive tests](https://mochajs.org/#inclusive-tests).

Another approach to specify tests without modifying the code is to run
`npm test` with option `-g`. You can apply a filer on the names of tests like
`npm test -- -g 'some test'`. Please note mocha arguments must be separated from
npm arguments using `--`. More usage and examples can be found in page
[mocha - option grep](https://mochajs.org/#-grep-regexp-g-regexp).
