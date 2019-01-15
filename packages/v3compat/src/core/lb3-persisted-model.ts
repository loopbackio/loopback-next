// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RemoteMethodOptions} from '../remoting';
import {Model} from './lb3-model';
import {Lb3Registry} from './lb3-registry';
import {
  Callback,
  ComplexValue,
  Filter,
  Options,
  PlainDataObject,
  Where,
} from './lb3-types';

export type PersistedModelClass = typeof PersistedModel;

export declare class PersistedModel extends Model {
  // CREATE - single instance
  static create(data: ModelData, options?: Options): Promise<PersistedModel>;
  static create(data: ModelData, callback: Callback<PersistedModel>): void;
  static create(
    data: ModelData,
    options: Options,
    callback: Callback<PersistedModel>,
  ): void;

  // CREATE - array of instances
  static create(data: ModelData, options?: Options): Promise<PersistedModel>;
  static create(data: ModelData[], callback: Callback<PersistedModel[]>): void;
  static create(
    data: ModelData[],
    options: Options,
    callback: Callback<PersistedModel[]>,
  ): void;

  static upsert(data: ModelData, options?: Options): Promise<PersistedModel>;
  static upsert(data: ModelData, callback: Callback<PersistedModel>): void;
  static upsert(
    data: ModelData,
    options: Options,
    callback: Callback<PersistedModel>,
  ): void;

  static updateOrCreate(
    data: ModelData,
    options?: Options,
  ): Promise<PersistedModel>;
  static updateOrCreate(
    data: ModelData,
    callback: Callback<PersistedModel>,
  ): void;
  static updateOrCreate(
    data: ModelData,
    options: Options,
    callback: Callback<PersistedModel>,
  ): void;

  static patchOrCreate(
    data: ModelData,
    options?: Options,
  ): Promise<PersistedModel>;
  static patchOrCreate(
    data: ModelData,
    options: Options,
    callback: Callback<PersistedModel>,
  ): void;
  static patchOrCreate(
    data: ModelData,
    callback: Callback<PersistedModel>,
  ): void;

  static upsertWithWhere(
    where: Where,
    data: ModelData,
    options?: Options,
  ): Promise<PersistedModel>;
  static upsertWithWhere(
    where: Where,
    data: ModelData,
    callback: Callback<PersistedModel>,
  ): void;
  static upsertWithWhere(
    where: Where,
    data: ModelData,
    options: Options,
    callback: Callback<PersistedModel>,
  ): void;

  // TODO: fix the API (callbacks vs promises)
  static patchOrCreateWithWhere(
    where: Where,
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  // TODO: fix the API (callbacks vs promises)
  static replaceOrCreate(
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  // TODO: fix the API (callbacks vs promises)
  static findOrCreate(
    filter: Filter,
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  // TODO: fix the API (callbacks vs promises)
  static exists(
    id: ComplexValue,
    options?: Options,
    callback?: Callback<boolean>,
  ): Promise<boolean>;

  // TODO: fix the API (callbacks vs promises)
  static findById(
    id: ComplexValue,
    filter?: Filter,
    options?: Options,
  ): Promise<PersistedModel>;
  static findById(
    id: ComplexValue,
    filter: Filter,
    options: Options | undefined,
    callback: Callback<boolean>,
  ): void;
  static findById(id: ComplexValue, callback?: Callback<boolean>): void;

  static find(filter?: Filter, options?: Options): Promise<PersistedModel[]>;
  static find(callback: Callback<PersistedModel>): void;
  static find(filter: Filter, callback: Callback<PersistedModel>): void;
  static find(
    filter: Filter,
    options: Options,
    callback: Callback<PersistedModel>,
  ): void;

  // TODO: fix the API (callbacks vs promises)
  static findOne(
    filter?: Filter,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  // TODO: fix the API (callbacks vs promises)
  static destroyAll(
    where?: Where,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  // TODO: fix the API (callbacks vs promises)
  static remove(
    where?: Where,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  // TODO: fix the API (callbacks vs promises)
  static deleteAll(
    where?: Where,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  // TODO: fix the API (callbacks vs promises)
  static updateAll(
    where?: Where,
    data?: ModelData,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  // TODO: fix the API (callbacks vs promises)
  static update(
    where?: Where,
    data?: ModelData,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  // TODO: fix the API (callbacks vs promises)
  static destroyById(
    id: ComplexValue,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  // TODO: fix the API (callbacks vs promises)
  static removeById(
    id: ComplexValue,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  static deleteById(id: ComplexValue, options?: Options): Promise<CountResult>;
  static deleteById(id: ComplexValue, callback: Callback<CountResult>): void;
  static deleteById(
    id: ComplexValue,
    options: Options,
    callback: Callback<CountResult>,
  ): void;

  // TODO: fix the API (callbacks vs promises)
  static replaceById(
    id: ComplexValue,
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  // TODO: fix the API (callbacks vs promises)
  static count(
    where?: Where,
    options?: Options,
    callback?: Callback<number>,
  ): Promise<number>;

  // TODO: describe PersistedModel API
  // - prototype.save
  // - prototype.isNewRecord
  // - prototype.delete
  // - prototype.updateAttribute
  // - prototype.updateAttributes
  // - prototype.replaceAttributes
  // - prototype.setId
  // - prototype.getId
  // - prototype.getIdName
}

export type ModelData = PlainDataObject | PersistedModel;

export interface CountResult {
  count: number;
}

export function setupPersistedModelClass(
  registry: Lb3Registry,
): typeof PersistedModel {
  const ModelCtor = registry.getModel('Model');
  const PersistedModelCtor = ModelCtor.extend<typeof PersistedModel>(
    'PersistedModel',
  );

  // TODO copy impl of setup and DAO methods from LB3's lib/persisted-model.js
  PersistedModelCtor.setup = function() {
    // tslint:disable-next-line:no-shadowed-variable no-invalid-this
    const PersistedModelCtor: PersistedModelClass = this;

    // call Model.setup first
    ModelCtor.setup.call(PersistedModelCtor);

    setupPersistedModelRemoting(PersistedModelCtor);
  };

  PersistedModelCtor.setup();

  return PersistedModelCtor;
}

// tslint:disable-next-line:no-shadowed-variable
function setupPersistedModelRemoting(PersistedModel: PersistedModelClass) {
  const typeName = PersistedModel.modelName;

  PersistedModel.create = function() {
    throw errorNotAttached(PersistedModel.modelName, 'create');
  };

  setRemoting(PersistedModel, 'create', {
    description:
      'Create a new instance of the model and persist it into the data source.',
    accessType: 'WRITE',
    accepts: [
      {
        arg: 'data',
        type: 'object',
        model: typeName,
        description: 'Model instance data',
        http: {source: 'body'},
      },
    ],
    returns: {arg: 'data', type: typeName, root: true},
    http: {verb: 'post', path: '/'},
  });

  PersistedModel.find = function() {
    throw errorNotAttached(PersistedModel.modelName, 'find');
  };

  setRemoting(PersistedModel, 'find', {
    description:
      'Find all instances of the model matched by filter from the data source.',
    accessType: 'READ',
    accepts: [
      {
        arg: 'filter',
        type: 'object',
        description:
          'Filter defining fields, where, include, order, offset, and limit - must be a ' +
          'JSON-encoded string ({"something":"value"})',
      },
    ],
    returns: {arg: 'data', type: [typeName], root: true},
    http: {verb: 'get', path: '/'},
  });

  PersistedModel.findById = function() {
    throw errorNotAttached(PersistedModel.modelName, 'find');
  };

  setRemoting(PersistedModel, 'findById', {
    description: 'Find a model instance by {{id}} from the data source.',
    accessType: 'READ',
    accepts: [
      {
        arg: 'id',
        type: 'any',
        description: 'Model id',
        required: true,
        http: {source: 'path'},
      },
      {
        arg: 'filter',
        type: 'object',
        description:
          'Filter defining fields and include - must be a JSON-encoded string (' +
          '{"something":"value"})',
      },
    ],
    returns: {arg: 'data', type: typeName, root: true},
    http: {verb: 'get', path: '/:id'},
    // TODO: rest: {after: convertNullToNotFoundError},
  });

  function setRemoting(
    // tslint:disable-next-line:no-any
    scope: any,
    name: string,
    options: RemoteMethodOptions,
  ) {
    const fn = scope[name];
    fn._delegate = true;
    options.isStatic = scope === PersistedModel;
    PersistedModel.remoteMethod(name, options);
  }
}

function errorNotAttached(modelName: string, methodName: string) {
  return new Error(
    `Cannot call ${modelName}.${methodName}().` +
      ` The ${modelName} method has not been setup.` +
      ' The PersistedModel has not been correctly attached to a DataSource!',
  );
}
