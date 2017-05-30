// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const jugglerModule = require('loopback-datasource-juggler');

import {MixinBuilder} from './mixin';
import {Class, ObjectType, Options, AnyType} from './common';

import {juggler} from './loopback-datasource-juggler';

export * from './loopback-datasource-juggler';

/* tslint:disable-next-line:variable-name */
export const DataSource = jugglerModule.DataSource as typeof juggler.DataSource;
/* tslint:disable-next-line:variable-name */
export const ModelBase = jugglerModule.ModelBaseClass as typeof juggler.ModelBase;

/**
 * This is a bridge to the legacy DAO class. The function mixes DAO methods
 * into a model class and attach it to a given data source
 * @param modelClass {} Model class
 * @param ds {DataSource} Data source
 * @returns {} The new model class with DAO (CRUD) operations
 */
export function bindModel<T extends typeof juggler.ModelBase>(modelClass: T,
  ds: juggler.DataSource): T {
  const boundModelClass = class extends modelClass {};
  boundModelClass.attachTo(ds);
  return boundModelClass;
}

import {Entity} from './model';
import {Filter, Where} from './query';
import {EntityCrudRepository} from './repository';

function isPromise<T>(p: AnyType): p is Promise<T> {
  return p !== null && typeof p === 'object' && typeof p.then === 'function';
}

function getPromise<T>(p: juggler.PromiseOrVoid<T>) {
  if (isPromise(p)) {
    return p;
  } else {
    return Promise.reject(new Error('The value should be a Promise: ' + p));
  }
}

export class DefaultCrudRepository<T extends Entity, ID>
implements EntityCrudRepository<T, ID> {
  modelClass: typeof juggler.PersistedModel;

  constructor( modelClass: typeof juggler.PersistedModel, dataSource: juggler.DataSource) {
    this.modelClass = bindModel(modelClass, dataSource);
  }

  create(entity: ObjectType<T>, options?: Options): Promise<T> {
    return getPromise(this.modelClass.create(entity, options));
  }

  createAll(entities: ObjectType<T>[], options?: Options): Promise<T[]> {
    return getPromise(this.modelClass.create(entities, options));
  }

  save(entity: ObjectType<T>, options?: Options): Promise<T> {
    if (entity.getId() == null) {
      return this.create(entity, options);
    } else {
      return this.replaceById(entity.getId, entity, options).
        then(result => result ? entity : null);
    }
  }

  find(filter?: Filter, options?: Options): Promise<T[]> {
    return getPromise(this.modelClass.find(filter, options));
  }

  findById(id: ID, filter?: Filter, options?: Options): Promise<T> {
    return getPromise(this.modelClass.findById(id, filter, options));
  }

  update(entity: ObjectType<T>, options?: Options): Promise<boolean> {
    return this.updateById(entity.getId(), entity, options);
  }

  delete(entity: ObjectType<T>, options?: Options): Promise<boolean> {
    return this.deleteById(entity.getId(), options);
  }

  updateAll(data: ObjectType<T>, where?: Where, options?: Options): Promise<number> {
    return getPromise(this.modelClass.updateAll(data, where, options));
  }

  updateById(id: ID, data: ObjectType<T>, options?: Options): Promise<boolean> {
    const idProp = this.modelClass.getIdName();
    const where = {} as Where;
    where[idProp] = id;
    return this.updateAll(data, where, options).then(count => count > 0);
  }

  replaceById(id: ID, data: ObjectType<T>, options?: Options): Promise<boolean> {
    return getPromise(this.modelClass.replaceById(id, data, options));
  }

  deleteAll(where?: Where, options?: Options): Promise<number> {
    return getPromise(this.modelClass.deleteAll(where, options));
  }

  deleteById(id: ID, options?: Options): Promise<boolean> {
    return getPromise(this.modelClass.deleteById(id, options));
  }

  count(where?: Where, options?: Options): Promise<number> {
    return getPromise(this.modelClass.count(where, options));
  }

  exists(id: ID, options?: Options): Promise<boolean> {
    return getPromise(this.modelClass.exists(id, options));
  }
}
