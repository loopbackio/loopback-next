import {Callback} from 'loopback-datasource-juggler';
import {
  AnyObject,
  Class,
  Count,
  CrudConnector,
  Entity,
  EntityData,
  Filter,
  Options,
  Where,
} from '../..';

// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A mock up connector implementation
 */
export class CrudConnectorStub implements CrudConnector {
  private entities: EntityData[] = [];
  name: 'my-connector';

  connect() {
    return Promise.resolve();
  }

  disconnect() {
    return Promise.resolve();
  }

  ping() {
    return Promise.resolve();
  }

  create(
    modelClass: Class<Entity>,
    entity: EntityData,
    options?: Options,
  ): Promise<EntityData> {
    this.entities.push(entity);
    return Promise.resolve(entity);
  }

  find(
    modelClass: Class<Entity>,
    filter?: Filter,
    options?: Options,
  ): Promise<EntityData[]> {
    return Promise.resolve(this.entities);
  }

  updateAll(
    modelClass: Class<Entity>,
    data: EntityData,
    where?: Where,
    options?: Options,
  ): Promise<Count> {
    for (const p in data) {
      for (const e of this.entities) {
        (e as AnyObject)[p] = (data as AnyObject)[p];
      }
    }
    return Promise.resolve({count: this.entities.length});
  }

  deleteAll(
    modelClass: Class<Entity>,
    where?: Where,
    options?: Options,
  ): Promise<Count> {
    const items = this.entities.splice(0, this.entities.length);
    return Promise.resolve({count: items.length});
  }

  count(
    modelClass: Class<Entity>,
    where?: Where,
    options?: Options,
  ): Promise<Count> {
    return Promise.resolve({count: this.entities.length});
  }

  // Promises are not allowed yet
  // See https://github.com/strongloop/loopback-datasource-juggler/issues/1659
  // for tracking support
  beginTransaction(options: Options, cb: Callback) {
    return cb(null, {});
  }
}
