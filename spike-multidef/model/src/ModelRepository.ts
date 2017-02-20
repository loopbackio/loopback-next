// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const VERSION = require('../package.json').version;

// TODO - typed Filter<Model>
export class Filter {
  where: Object;
  include: Array<string>;
  skip: number;
  limit: number;
};

export interface DataAccessConnector {
  find(modelName: string, filter: Filter): Promise<any[]>;
  create(modelName: string, data: any): Promise<any>;
};

export interface Model {
  toObject() : Partial<Model>;
}

export abstract class ModelRepository<M extends Model> {
  public static readonly MODEL_VERSION: string = VERSION;

  protected constructor(
    protected readonly _modelCtor: { new(data: Partial<M>): M },
    protected readonly _modelName: string,
    public readonly connector: DataAccessConnector) {
  }

  public async find(filter: Filter): Promise<M[]> {
    const rawList: Object[] = await this.connector.find(this._modelName, filter || new Filter());
    return rawList.map(data => this._createInstance(data as any));
  }

  public async create(data: Partial<M>): Promise<M> {
    if (!(data instanceof this._modelCtor)) {
      // Fill-in property defaults
      const inst: M = this._createInstance(data);
      data = inst.toObject() as any;
    } else {
      data = (data as M).toObject() as any;
    }

    // Allow the connector/database to add auto-generated fields like "id"
    const updatedData = await this.connector.create(this._modelName, data);
    return this._createInstance(updatedData as any);
  }

  protected _createInstance(data: Partial<M>): M {
    const ctor = this._modelCtor;
    return new ctor(data);
  }
}
