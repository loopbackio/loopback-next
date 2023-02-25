import {LifeCycleObserver} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import debugFactory from 'debug';
import {Dialect, Options as SequelizeOptions, Sequelize} from 'sequelize';
import {
  SupportedConnectorMapping as supportedConnectorMapping,
  SupportedLoopbackConnectors,
} from './connector-mapping';

const debug = debugFactory('loopback:sequelize:datasource');
const queryLogging = debugFactory('loopback:sequelize:queries');

export class SequelizeDataSource implements LifeCycleObserver {
  name: string;
  settings = {};
  constructor(public config: SequelizeDataSourceConfig) {
    if (
      this.config.connector &&
      !(this.config.connector in supportedConnectorMapping)
    ) {
      throw new Error(
        `Specified connector ${
          this.config.connector ?? this.config.dialect
        } is not supported.`,
      );
    }
  }

  sequelize?: Sequelize;
  sequelizeConfig: SequelizeDataSourceConfig;
  async init(): Promise<void> {
    const connector = this.config.connector;
    const storage = this.config.file;
    const schema = this.config.schema;

    this.sequelizeConfig = {
      database: this.config.database,
      ...(connector
        ? {dialect: supportedConnectorMapping[connector] as Dialect}
        : {}),
      ...(storage ? {storage: storage} : {}),
      host: this.config.host,
      port: this.config.port,
      ...(schema ? {schema: schema} : {}),
      username: this.config.user ?? this.config.username,
      password: this.config.password,
      logging: queryLogging,
    };

    this.sequelize = new Sequelize(this.sequelizeConfig);

    try {
      await this.sequelize.authenticate();
      debug('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }
  async start(..._injectedArgs: unknown[]): Promise<void> {}
  stop() {
    this.sequelize?.close?.().catch(console.error);
  }

  automigrate() {
    throw new Error(
      'Migrations are not supported when using SequelizeDatasource, Use `db-migrate` package instead.',
    );
  }
  autoupdate() {
    throw new Error(
      'Migrations are not supported when using SequelizeDatasource, Use `db-migrate` package instead.',
    );
  }
}

export type SequelizeDataSourceConfig = SequelizeOptions & {
  name?: string;
  user?: string;
  connector?: SupportedLoopbackConnectors;
  url?: string;
} & AnyObject;
