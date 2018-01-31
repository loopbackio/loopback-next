// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable:no-any

const debug = require('debug')(
  'loopback:repositories:account:datasources:connections:mysql',
);
const mysql = require('mysql');
const db = require('mysql-promise')();
import {
  Class,
  CrudConnector,
  DataSource,
  Entity,
  EntityData,
  Filter,
  ObjectType,
  Options,
  Where,
} from '@loopback/repository';

export class MySqlConn implements CrudConnector {
  //fixme make connection strongly typed
  private connection: any;

  constructor(config: Object) {
    db.configure(config, mysql);
    this.connection = db;
  }
  name: 'mysql';
  interfaces?: string[];
  connect(): Promise<void> {
    return this.connection.connect();
  }
  disconnect(): Promise<void> {
    return this.connection.end();
  }
  ping(): Promise<void> {
    return this.connection.ping();
  }

  updateAll(
    modelClass: Class<Entity>,
    data: EntityData,
    where: Where,
    options: Options,
  ): Promise<number> {
    throw new Error('Not implemented yet.');
  }

  create(
    modelClass: Class<Entity>,
    entity: EntityData,
    options: Options,
  ): Promise<EntityData> {
    const self = this;
    const placeHolders = [];
    for (const prop in modelClass.definition.properties) {
      placeHolders.push('?');
    }
    const createQuery =
      'INSERT INTO ?? VALUES (' + placeHolders.join(',') + ')';
    const vals = [modelClass.modelName];
    for (const prop in entity) {
      vals.push(entity[prop]);
    }
    const sqlStmt = mysql.format(createQuery, vals);
    debug('Insert ', sqlStmt);

    return self.connection.query(sqlStmt).spread(function(result: any) {
      if (result) {
        //MySQL returns count of affected rows, but as part of our API
        //definition, we return the instance we used to create the row
        return entity;
      }
    });
  }

  save(
    modelClass: Class<Entity>,
    entity: EntityData,
    options: Options,
  ): Promise<EntityData> {
    throw new Error('Not implemented yet.');
  }

  find(
    modelClass: Class<Entity>,
    filter: Filter,
    options: Options,
  ): Promise<EntityData[]> {
    const self = this;
    let findQuery = 'SELECT * FROM ?? ';
    findQuery = mysql.format(findQuery, [modelClass.modelName]);
    if (filter.where) {
      let whereClause = '?? = ?';
      for (const key in filter.where) {
        whereClause = mysql.format(whereClause, [key, filter.where[key]]);
      }
      findQuery += ' WHERE ' + whereClause;
    }
    debug('Find ', findQuery);
    return self.connection.query(findQuery).spread(function(rows: any) {
      return rows;
    });
  }

  findById(
    modelClass: Class<Entity>,
    id: any,
    options: Options,
  ): Promise<EntityData> {
    throw new Error('Not implemented yet.');
  }

  update(
    modelClass: Class<Entity>,
    entity: EntityData,
    options: Options,
  ): Promise<boolean> {
    throw new Error('Not implemented yet.');
  }

  delete(
    modelClass: Class<Entity>,
    entity: EntityData,
    options: Options,
  ): Promise<boolean> {
    throw new Error('Not implemented yet.');
  }

  createAll(
    modelClass: Class<Entity>,
    entities: EntityData[],
    options: Options,
  ): Promise<EntityData[]> {
    throw new Error('Not implemented yet.');
  }

  updateById(
    modelClass: Class<Entity>,
    id: any,
    data: EntityData,
    options: Options,
  ): Promise<boolean> {
    const self = this;
    let updateQuery = 'UPDATE ?? SET ';
    updateQuery = mysql.format(updateQuery, [modelClass.modelName]);
    const updateClause = [];
    for (const prop in data) {
      updateClause.push(mysql.format('??=?', [prop, data[prop]]));
    }
    updateQuery += updateClause.join(',');
    const whereClause = mysql.format(' WHERE ??=?', ['id', id]);
    updateQuery += whereClause;

    debug('updateById ', updateQuery);
    return self.connection.query(updateQuery).spread(function(result: any) {
      return result.affectedRows;
    });
  }

  replaceById(
    modelClass: Class<Entity>,
    id: any,
    data: EntityData,
    options: Options,
  ): Promise<boolean> {
    throw new Error('Not implemented yet.');
  }

  deleteAll(
    modelClass: Class<Entity>,
    where: Where,
    options: Options,
  ): Promise<number> {
    throw new Error('Not implemented yet.');
  }

  deleteById(
    modelClass: Class<Entity>,
    id: any,
    options: Options,
  ): Promise<boolean> {
    const self = this;
    let deleteQuery = 'DELETE FROM ?? ';
    deleteQuery = mysql.format(deleteQuery, modelClass.modelName);
    const whereClause = mysql.format(' WHERE ??=?', ['id', id]);
    deleteQuery += whereClause;

    debug('deleteById ', deleteQuery);
    return self.connection.query(deleteQuery).spread(function(result: any) {
      return result.affectedRows;
    });
  }

  count(
    modelClass: Class<Entity>,
    where: Where,
    options: Options,
  ): Promise<number> {
    throw new Error('Not implemented yet.');
  }

  exists(
    modelClass: Class<Entity>,
    id: any,
    options: Options,
  ): Promise<boolean> {
    throw new Error('Not implemented yet.');
  }
}
