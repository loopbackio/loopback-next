import {Entity} from './model';

class Repository<T extends Entity> {

  constructor(public connector: any, public model: T) {

  }

  create(entity: T | T[], options?: Object): Promise<T | T[]> {
    return this.connector.create(this.model, entity, options);
  }

  upsert(entity: T, options: Object): Promise<T> {
    return this.connector.upsert(this.model, entity, options);
  }

  find(filter?: any, options?: Object): Promise<T[]> {
    return this.connector.find(this.model, filter, options);
  }

  findById(id: any, options?: Object): Promise<T[]> {
    return this.connector.findById(this.model, id, options);
  }

  update(entity: T, options?: Object): Promise<boolean> {
    return this.connector.updateById(this.model, entity.getId(), options);
  }

  delete(entity: T, options?: Object): Promise<boolean> {
    return this.connector.deleteById(this.model, entity.getId(), options);
  }

  updateAll(data: any, where?: any, options?: Object): Promise<number> {
    return this.connector.update(this.model, where, options);
  }

  updateById(data: any, id: any, options?: Object): Promise<number> {
    return this.connector.updateById(this.model, id, options);
  }

  deleteAll(where?: any, options?: Object): Promise<number> {
    return this.connector.delete(this.model, where, options);
  }

  deleteById(id: any, options?: Object): Promise<number> {
    return this.connector.deleteById(this.model, id, options);
  }
}