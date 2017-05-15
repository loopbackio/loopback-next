export const jugglerModule = require('loopback-datasource-juggler');

import {MixinBuilder} from './mixin';
import {Class} from './common';

import {juggler} from './loopback-datasource-juggler';

export * from './loopback-datasource-juggler';

export const DataSource = jugglerModule.DataSource as typeof juggler.DataSource;
export const ModelBase = jugglerModule.ModelBaseClass as typeof juggler.ModelBase;

/**
 * This is a bridge to the legacy DAO class. The function mixes DAO methods
 * into a model class and attach it to a given data source
 * @param ds {DataSource} Data source
 * @param modelClass {} Model class
 * @returns {} The new model class with DAO (CRUD) operations
 */
export function bindModel<T extends typeof juggler.ModelBase>(ds: juggler.DataSource,
  modelClass: T): T {
  let boundModelClass = class extends modelClass {};
  boundModelClass.attachTo(ds);
  return boundModelClass;
};
