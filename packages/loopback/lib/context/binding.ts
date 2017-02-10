// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export class Binding {
  public value;

  constructor(private _key: string) {
  }

  get key() {
    return this._key;
  }

  to(value: any) : this {
    this.value = value;
    return this;
  }
}
