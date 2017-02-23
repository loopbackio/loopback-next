// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export class Binding {
  public value: any;
  private _isDynamic: boolean = false;
  private _tagName: string;

  constructor(private _key: string, private _isLocked?: boolean) {
    if (!_isLocked)
      this._isLocked = false;
  }

  get isDynamic() { return this._isDynamic; }
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
    this.value = value;
    return this;
  }

  toDynamicValue(value: any): this {
    this.value = value;
    this._isDynamic = true;
    return this;
  }

  unlock() {
    this._isLocked = false;
  }
}
