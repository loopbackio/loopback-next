// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {Application} from '@loopback/core';
import {CompatComponent} from './compat.component';
import {Lb3Application} from './core';

/**
 * A mixin class for Application that adds `v3compat` property providing
 * access to LB3 application-like object.
 *
 * ```ts
 * class MyApplication extends CompatMixin(RestApplication) {
 *   constructor() {
 *     const lb3app = this.v3compat;
 *     const Todo = lb3app.registry.createModel(
 *       'Todo',
 *       {title: {type: 'string', required: true}},
 *       {strict: true}
 *     );
 *     lb3app.dataSource('db', {connector: 'memory'});
 *     lb3app.model(Todo, {dataSource: 'db'});
 *   }
 * }
 * ```
 *
 * TODO: describe "app.v3compat" property, point users to documentation
 * for Lb3Application class.
 *
 */
// tslint:disable-next-line:no-any
export function CompatMixin<T extends Constructor<any>>(superClass: T) {
  return class extends superClass {
    v3compat: Lb3Application;

    // tslint:disable-next-line:no-any
    constructor(...args: any[]) {
      super(...args);
      this.v3compat = new Lb3Application((this as unknown) as Application);
      this.component(CompatComponent);
    }
  };
}
