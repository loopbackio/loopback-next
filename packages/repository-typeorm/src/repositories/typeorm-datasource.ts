// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository-typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  createConnection,
  ConnectionOptions,
  Connection,
  ObjectType,
  Repository,
  EntityManager,
} from 'typeorm';

export class TypeORMDataSource {
  connection: Connection;

  constructor(public settings: ConnectionOptions) {}

  async connect(): Promise<Connection> {
    this.connection = await createConnection(this.settings);
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    await this.connection.close();
  }

  async getEntityManager() {
    await this.connect();
    return this.connection.createEntityManager();
  }

  async getRepository<T>(entityClass: ObjectType<T>): Promise<Repository<T>> {
    await this.connect();
    return this.connection.getRepository(entityClass);
  }
}
