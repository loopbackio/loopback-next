import {Entity} from '../model';
import {DataObject, Options, AnyObject} from '../common-types';
import {Filter} from '../query';
import {EntityCrudRepository} from './repository';
import {
  DefaultCrudRepository,
  juggler,
  ensurePromise,
} from './legacy-juggler-bridge';
import * as assert from 'assert';
import * as legacy from 'loopback-datasource-juggler';

export interface AtomicCrudRepository<T extends Entity, ID>
  extends EntityCrudRepository<T, ID> {
  /**
   * Finds one record matching the filter object. If not found, creates
   * the object using the data provided as second argument. In this sense it is
   * the same as `find`, but limited to one object. Returns an object, not
   * collection. If you don't provide the filter object argument, it tries to
   * locate an existing object that matches the `data` argument.
   *
   * @param filter Filter object used to match existing model instance
   * @param entity Entity to be used for creating a new instance or match
   * existing instance if filter is empty
   * @param options Options for the operation
   * @returns A promise that will be resolve with the created or found instance
   * and a 'created' boolean value
   */
  findOrCreate(
    filter: Filter<T>,
    entity: DataObject<T>,
    options?: Options,
  ): Promise<[T, boolean]>;
}

export class DefaultAtomicCrudRepository<T extends Entity, ID>
  extends DefaultCrudRepository<T, ID>
  implements AtomicCrudRepository<T, ID> {
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
  ) {
    assert(
      dataSource.connector !== undefined,
      `Connector instance must exist and support atomic operations`,
    );
    super(entityClass, dataSource);
  }

  async findOrCreate(
    filter: Filter<T>,
    entity: DataObject<T>,
    options?: AnyObject | undefined,
  ): Promise<[T, boolean]> {
    if (
      this.dataSource.connector &&
      typeof this.dataSource.connector.findOrCreate === 'function'
    ) {
      const result = await ensurePromise(
        this.modelClass.findOrCreate(filter as legacy.Filter, entity, options),
      );
      return [this.toEntity(result[0]), result[1]];
    } else {
      throw new Error('Method not implemented.');
    }
  }
}
