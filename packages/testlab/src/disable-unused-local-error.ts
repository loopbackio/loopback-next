// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable-next-line:no-any
let ref: any = true;

// Disable compiler error: 'ref' is declared but its value is never read.
ref = !ref;

/**
 * A helper function to create a dummy reference to a local value that's
 * otherwise not used anywhere in the code. Use it to surpress "tsc" warning
 * "(something) is declared but never used".
 *
 * @param value A value to mark as used for the compiler.
 */
export function disableUnusedLocalError<T>(value: T) {
  ref = value;
}
