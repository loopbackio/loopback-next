// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable-next-line:no-any
export type TestCallbackRetval = void | PromiseLike<any>;

/**
 * Helper function for skipping tests on Travis env
 * @param expectation
 * @param callback
 */
export function itSkippedOnTravis(
  expectation: string,
  callback?: (
    this: Mocha.ITestCallbackContext,
    done: MochaDone,
  ) => TestCallbackRetval,
): void {
  if (process.env.TRAVIS) {
    it.skip(`[SKIPPED ON TRAVIS] ${expectation}`, callback);
  } else {
    it(expectation, callback);
  }
}
