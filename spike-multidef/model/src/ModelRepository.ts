// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const VERSION = require('../package.json').version;

export class Filter {
  where: Object;
  include: Array<string>;
  skip: number;
  limit: number;
};

export interface DataAccessConnector {
  find(modelName: string, filter: Filter): Promise<Object[]>;
  create(modelName: string, data: Object): Promise<Object>;
};

export interface Model {
  toObject() : Object;
}

export abstract class ModelRepository<M extends Model> {
  public static readonly MODEL_VERSION: string = VERSION;

  protected constructor(
    protected readonly _modelCtor: { new(data: Object): M },
    protected readonly _modelName: string,
    public readonly connector: DataAccessConnector) {
  }

  public async find(filter: Filter): Promise<M[]> {
    const rawList: Object[] = await this.connector.find(this._modelName, filter || new Filter());
    return rawList.map(data => this._createInstance(data));
  }

  public async create(data: Object): Promise<M> {
    if (!(data instanceof this._modelCtor)) {
      // Fill-in property defaults
      const inst: M = this._createInstance(data);
      data = inst.toObject();
    } else {
      data = (data as M).toObject();
    }

    // Allow the connector/database to add auto-generated fields like "id"
    const updatedData = await this.connector.create(this._modelName, data);
    return this._createInstance(updatedData);
  }

  protected _createInstance(data: Object): M {
    const ctor = this._modelCtor;
    return new ctor(data);
  }
}
