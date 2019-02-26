// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as legacy from 'loopback-datasource-juggler';

import {Options, DataObject} from '../common-types';
import {Entity} from '../model';

import {KeyValueRepository, KeyValueFilter} from './kv.repository';

import {juggler, ensurePromise} from './legacy-juggler-bridge';

/**
 * Polyfill for Symbol.asyncIterator
 * See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(Symbol as any).asyncIterator) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Symbol as any).asyncIterator = Symbol.for('Symbol.asyncIterator');
}

/**
 * An implementation of KeyValueRepository based on loopback-datasource-juggler
 */
export class DefaultKeyValueRepository<T extends Entity>
  implements KeyValueRepository<T> {
  /**
   * A legacy KeyValueModel class
   */
  kvModelClass: typeof juggler.KeyValueModel;

  /**
   * Construct a KeyValueRepository with a legacy DataSource
   * @param ds - Legacy DataSource
   */
  constructor(
    private entityClass: typeof Entity & {prototype: T},
    ds: juggler.DataSource,
  ) {
    // KVModel class is placeholder to receive methods from KeyValueAccessObject
    // through mixin
    this.kvModelClass = ds.createModel<typeof juggler.KeyValueModel>(
      '_kvModel',
    );
  }

  delete(key: string, options?: Options): Promise<void> {
    return ensurePromise(this.kvModelClass.delete(key, options));
  }

  deleteAll(options?: Options): Promise<void> {
    return ensurePromise(this.kvModelClass.deleteAll(options));
  }

  protected toEntity(modelData: legacy.ModelData): T {
    if (modelData == null) return modelData;
    let data = modelData;
    if (typeof modelData.toObject === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data = (modelData as any).toObject();
    }
    return new this.entityClass(data) as T;
  }

  async get(key: string, options?: Options): Promise<T> {
    const val = this.kvModelClass.get(key, options) as legacy.PromiseOrVoid<
      legacy.ModelData
    >;
    const result = await ensurePromise(val);
    return this.toEntity(result);
  }

  set(key: string, value: DataObject<T>, options?: Options): Promise<void> {
    return ensurePromise<void>(this.kvModelClass.set(key, value, options));
  }

  expire(key: string, ttl: number, options?: Options): Promise<void> {
    return ensurePromise<void>(this.kvModelClass.expire(key, ttl, options));
  }

  ttl(key: string, options?: Options): Promise<number> {
    return ensurePromise<number>(this.kvModelClass.ttl(key, options));
  }

  keys(filter?: KeyValueFilter, options?: Options): AsyncIterable<string> {
    const kvModelClass = this.kvModelClass;
    const iterator = {
      [Symbol.asyncIterator]() {
        return new AsyncKeyIteratorImpl(
          kvModelClass.iterateKeys(filter, options),
        );
      },
    };
    return iterator;
  }
}

class AsyncKeyIteratorImpl implements AsyncIterator<string> {
  constructor(private keys: legacy.AsyncKeyIterator) {}
  next() {
    const key = ensurePromise<string | undefined>(this.keys.next());
    return key.then(k => {
      return {done: k === undefined, value: k || ''};
    });
  }
}
