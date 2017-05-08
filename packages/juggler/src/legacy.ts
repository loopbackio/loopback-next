export const jugglerModule = require('loopback-datasource-juggler');

import {MixinBuilder} from './mixin';
import {Class} from './common';

import {juggler} from './loopback-datasource-juggler.d';

export * from './loopback-datasource-juggler.d';

export const DataSource = jugglerModule.DataSource as juggler.DataSourceClass;
export const Model = jugglerModule.ModelBaseClass as juggler.ModelClass<juggler.Model>;

/**
 * This is a bridge to the legacy DAO class. The function mixes DAO methods
 * into a model class and attach it to a given data source
 * @param ds {DataSource} Data source
 * @param modelClass {} Model class
 * @returns {} The new model class with DAO (CRUD) operations
 */
export function bindModel(ds: juggler.DataSource,
  modelClass: juggler.ModelClass<any>): juggler.ModelClass<any> {
  let boundModelClass = class extends modelClass {};
  boundModelClass.attachTo(ds);
  return boundModelClass;
};
