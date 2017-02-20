// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DataAccessConnector, Filter, VERSION as ModelVersion} from 'model';

type ModelStore = Map<string, Object>;

export class MemoryConnector implements DataAccessConnector {
  public static readonly MODEL_VERSION: string = ModelVersion;

  private _nextId = 1;
  private _store: Map<string, ModelStore> = new Map<string, ModelStore>();

  public async find(modelName: string, filter: Filter): Promise<Object[]> {
    const values: Object[] = Array.from(this.getStoreForModel(modelName).values());
    return Promise.resolve(values);
  }

  public async create(modelName: string, data: Object): Promise<Object> {
    let id: string = (data as any).id;
    if (!id) {
      id = '' + this._nextId++;
      (data as any).id = id;
    }

    this.getStoreForModel(modelName).set(id, data);
    return Promise.resolve(data);
  }

  protected getStoreForModel(modelName: string): Map<string, Object> {
    if (this._store.has(modelName)) {
      const store = this._store.get(modelName);
      return store;
    }

    const store = new Map<string, Object>();
    this._store.set(modelName, store);
    return store;
  }
};
