// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * log decorator
 */
export function log() {
  return function (target: object | Function) {};
}

/**
 * Hello class
 */
@log()
export class Hello {
  constructor(public name: string) {}

  /**
   * Return a greeting
   * @param msg - Message
   */
  greet(msg: string) {
    return `Hello, ${this.name}: ${msg}`;
  }
}
