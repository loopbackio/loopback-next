// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Simplified test function type from Mocha
export interface TestFn {
  (this: TestContext): PromiseLike<unknown>;
  (this: TestContext, done: Function): void;
}

// Type of "this" object provided by Mocha to test functions
export interface TestContext {
  skip(): this;
  timeout(ms: number | string): this;
  retries(n: number): this;
  slow(ms: number): this;
  // tslint:disable-next-line:no-any
  [index: string]: any;
}

/**
 * Helper function for skipping tests on Travis env
 * @param expectation
 * @param callback
 */
export function itSkippedOnTravis(
  expectation: string,
  callback?: TestFn,
): void {
  if (process.env.TRAVIS) {
    it.skip(`[SKIPPED ON TRAVIS] ${expectation}`, callback);
  } else {
    it(expectation, callback);
  }
}
