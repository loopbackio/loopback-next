// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Model} from './lb3-model';
import {Lb3Registry} from './lb3-registry';
import {
  Callback,
  Options,
  PlainDataObject,
  Filter,
  ComplexValue,
  Where,
} from './lb3-types';

export type PersistedModelClass = typeof PersistedModel;

export declare class PersistedModel extends Model {
  static create(
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  static create(
    data: ModelData[],
    options?: Options,
    callback?: Callback<PersistedModel[]>,
  ): Promise<PersistedModel[]>;

  static upsert(
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  static updateOrCreate(
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  static patchOrCreate(
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  static upsertWithWhere(
    where: Where,
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  static patchOrCreateWithWhere(
    where: Where,
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  static replaceOrCreate(
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  static findOrCreate(
    filter: Filter,
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  static exists(
    id: ComplexValue,
    options?: Options,
    callback?: Callback<boolean>,
  ): Promise<boolean>;

  static findById(
    id: ComplexValue,
    filter?: Filter,
    options?: Options,
    callback?: Callback<boolean>,
  ): Promise<PersistedModel>;

  static find(
    filter?: Filter,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel[]>;

  static findOne(
    filter?: Filter,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

  static destroyAll(
    where?: Where,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  static remove(
    where?: Where,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  static deleteAll(
    where?: Where,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  static updateAll(
    where?: Where,
    data?: ModelData,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  static update(
    where?: Where,
    data?: ModelData,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  static destroyById(
    id: ComplexValue,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  static removeById(
    id: ComplexValue,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  static deleteById(
    id: ComplexValue,
    options?: Options,
    callback?: Callback<CountResult>,
  ): Promise<CountResult>;

  static replaceById(
    id: ComplexValue,
    data: ModelData,
    options?: Options,
    callback?: Callback<PersistedModel>,
  ): Promise<PersistedModel>;

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

  return PersistedModelCtor;
}
