// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export class GreetingService {
  greet(whom: string = 'world') {
    return Promise.resolve(`Hello ${whom}`);
  }
}
