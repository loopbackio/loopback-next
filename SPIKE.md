Since LoopBack 4 offers a way to mount LoopBack 3 applications on a LoopBack 4
project with the use of
[`@loopback/booter-lb3app`](https://github.com/strongloop/loopback-next/tree/master/packages/booter-lb3app),
there should also be a way for users to run their tests as part of LoopBack 4's
`npm test` command.

We want the LoopBack 3 tests to use the LoopBack 4 server rather than the
LoopBack 3 application. This spike aims to test running both acceptance and
integration LoopBack 3 tests.

## All Tests

In order to run LoopBack 3's tests from their current folder, add LB3 tests'
path to `test` entry in package.json:

- `"test": "lb-mocha \"dist/**tests**/\*_/_.js\" \"lb3app/test/\*.js\""`

In this case, the test folder lies is `/lb3app/test` from the root of the
LoopBack 4 project.
