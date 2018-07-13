// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as legacy from 'loopback-datasource-juggler';

import {Options, DataObject} from '../common-types';
import {Model} from '../model';

import {KVRepository, AsyncIterator, KVFilter} from './kv.repository';

import {juggler, ensurePromise} from './legacy-juggler-bridge';

/**
 * An implementation of KVRepository based on legacy loopback-datasource-juggler
 */
export class DefaultKVRepository<T extends Model> implements KVRepository<T> {
  kvModelClass: typeof juggler.KeyValueModel;

  constructor(kvModelClass: typeof juggler.KeyValueModel) {
    this.kvModelClass = kvModelClass;
  }

  delete(key: string, options?: Options): Promise<void> {
    return ensurePromise(this.kvModelClass.delete(key, options));
  }

  deleteAll(options?: Options): Promise<void> {
    return ensurePromise(this.kvModelClass.deleteAll(options));
  }

  get(key: string, options?: Options): Promise<T> {
    const val = this.kvModelClass.get(key, options) as legacy.PromiseOrVoid<T>;
    return ensurePromise<T>(val);
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

  keys(filter?: KVFilter, options?: Options): Promise<string[]> {
    return ensurePromise<string[]>(this.kvModelClass.keys(filter, options));
  }

  iterateKeys(filter?: KVFilter, options?: Options): AsyncIterator<string> {
    return new AsyncKeyIteratorImpl(
      this.kvModelClass.iterateKeys(filter, options),
    );
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
