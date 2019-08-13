// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// NOTE(bajtos) At the moment, ServiceBooter recognizes only service providers.
// This class is used by tests to verify that non-provider classes are ignored.
export class GreetingService {
  greet(whom = 'world') {
    return Promise.resolve(`Hello ${whom}`);
  }
}
