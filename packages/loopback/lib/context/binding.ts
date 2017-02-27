// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export class Binding {
  public value: any;
  public getValue: () => any = () => { throw new Error(`No value was configured for binding {this._key}.`); };
  private _tagName: string;

  constructor(private _key: string, private _isLocked?: boolean) {
    if (!_isLocked)
      this._isLocked = false;
  }

  get isLocked() { return this._isLocked; }
  get key() { return this._key; }
  get tagName() { return this._tagName; }

  lock() {
    this._isLocked = true;
  }

  tag(tagName: string): this {
    this._tagName = tagName;
    return this;
  }

  to(value: any): this {
    this.getValue = () => value;
    return this;
  }

  toDynamicValue(factoryFn: () => any): this {
    this.getValue = factoryFn;
    return this;
  }

  unlock() {
    this._isLocked = false;
  }
}
