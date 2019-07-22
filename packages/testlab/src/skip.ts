// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A function defining a new test case or a test suite, e.g. `it` or `describe`.
 */
export type TestDefinition<ARGS extends unknown[], RETVAL> = (
  name: string,
  ...args: ARGS
) => RETVAL;

/**
 * Helper function for skipping tests when a certain condition is met.
 *
 * @example
 * ```ts
 * skipIf(
 *   !features.freeFormProperties,
 *   describe,
 *  'free-form properties (strict: false)',
 *   () => {
 *     // the tests
 *   }
 * );
 * ```
 *
 * @param skip - Should the test case/suite be skipped?
 * @param verb - The function to invoke to define the test case or the test
 * suite, e.g. `it` or `describe`.
 * @param name - The test name (the first argument of `verb` function).
 * @param args - Additional arguments (framework specific), typically a function
 * implementing the test.
 */
export function skipIf<ARGS extends unknown[], RETVAL>(
  skip: boolean,
  verb: TestDefinition<ARGS, RETVAL> & {skip: TestDefinition<ARGS, RETVAL>},
  name: string,
  ...args: ARGS
): RETVAL {
  if (skip) {
    return verb.skip(`[SKIPPED] ${name}`, ...args);
  } else {
    return verb(name, ...args);
  }
}

/**
 * Helper function for skipping tests on Travis CI.
 *
 * @example
 *
 * ```ts
 * skipOnTravis(it, 'does something when some condition', async () => {
 *   // the test
 * });
 * ```
 *
 * @param verb - The function to invoke to define the test case or the test
 * suite, e.g. `it` or `describe`.
 * @param name - The test name (the first argument of `verb` function).
 * @param args - Additional arguments (framework specific), typically a function
 * implementing the test.
 */
export function skipOnTravis<ARGS extends unknown[], RETVAL>(
  verb: TestDefinition<ARGS, RETVAL> & {skip: TestDefinition<ARGS, RETVAL>},
  name: string,
  ...args: ARGS
): RETVAL {
  if (process.env.TRAVIS) {
    return verb.skip(`[SKIPPED ON TRAVIS] ${name}`, ...args);
  } else {
    return verb(name, ...args);
  }
}

/*** LEGACY API FOR BACKWARDS COMPATIBILITY ***/

// TODO(semver-major) remove this code

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any;
}

/**
 * Helper function for skipping tests on Travis env - legacy variant
 * supporting `it` only.
 *
 * @param expectation - The test name (the first argument of `it` function).
 * @param callback - The test function (the second argument of `it` function).
 *
 * @deprecated Use `skipOnTravis(it, name, fn)` instead.
 */
export function itSkippedOnTravis(
  expectation: string,
  callback?: TestFn,
): void {
  skipOnTravis(it, expectation, callback);
}
