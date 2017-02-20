import {DataSource, ModelBaseClass as Model, KeyValueAccessObject} from 'loopback-datasource-juggler';
import DAO = require('loopback-datasource-juggler/lib/dao');

import {MixinBuilder, Constructable} from './mixin';

module.exports = function (ds: DataSource, Model: Constructable) {
  let BoundModel = class extends Model {
    static dataSource: DataSource;
  };
  BoundModel.dataSource = ds;

  let CRUDModel = MixinBuilder.mix(BoundModel).with(DAO);

  return CRUDModel;
};