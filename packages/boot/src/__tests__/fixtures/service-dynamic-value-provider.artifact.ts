// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export class DynamicDateProvider {
  static value() {
    return new Date();
  }
}
