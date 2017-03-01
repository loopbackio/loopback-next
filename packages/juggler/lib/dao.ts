import {DataSource, ModelBaseClass as Model, KeyValueAccessObject} from 'loopback-datasource-juggler';
import DAO = require('loopback-datasource-juggler/lib/dao');

import {MixinBuilder, Constructor} from './mixin';

/**
 * This is a bridge to the legacy DAO class. The function mixes DAO methods
 * into a model class and attach it to a given data source
 * @param ds {DataSource} Data source
 * @param Model {} Model class
 * @returns {} The new model class with DAO (CRUD) operations
 */
module.exports = function (ds: DataSource, Model: Constructor) {
  let BoundModel = class extends Model {
    static dataSource: DataSource;
  };
  BoundModel.dataSource = ds;

  let CRUDModel = MixinBuilder.mix(BoundModel).with(DAO);

  return CRUDModel;
};