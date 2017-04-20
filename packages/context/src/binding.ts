// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, Constructor} from './context';

// tslint:disable-next-line:no-any
export type BoundValue = any;

export class Binding {
  // FIXME(bajtos) The binding class should be parameterized by the value type stored
  public value: BoundValue;
  public getValue: () => BoundValue = () => { throw new Error(`No value was configured for binding ${this._key}.`); };
  private _tagName: string;

  // For bindings bound via toClass, this property contains the constructor function
  public valueConstructor: Constructor<BoundValue>;

  constructor(private readonly _context: Context, private readonly _key: string, public isLocked: boolean = false) {}
  get key() { return this._key; }
  get tagName() { return this._tagName; }

  lock() {
    this.isLocked = true;
  }

  tag(tagName: string): this {
    this._tagName = tagName;
    return this;
  }

  to(value: BoundValue): this {
    this.getValue = () => value;
    return this;
  }

  toDynamicValue(factoryFn: () => BoundValue): this {
    this.getValue = factoryFn;
    return this;
  }

  toClass<T>(ctor: Constructor<T>): this {
    this.getValue = () => this._context.createClassInstance(ctor);
    this.valueConstructor = ctor;
    return this;
  }

  unlock() {
    this.isLocked = false;
  }
}
