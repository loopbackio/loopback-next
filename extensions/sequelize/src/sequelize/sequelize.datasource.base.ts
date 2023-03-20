import {LifeCycleObserver} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import debugFactory from 'debug';
import {
  PoolOptions,
  Sequelize,
  Options as SequelizeOptions,
  Transaction,
  TransactionOptions,
} from 'sequelize';
import {
  ConnectionPoolOptions,
  LoopbackPoolConfigKey,
  PoolingEnabledConnector,
  SupportedLoopbackConnectors,
  poolConfigKeys,
  poolingEnabledConnectors,
  SupportedConnectorMapping as supportedConnectorMapping,
} from './connector-mapping';

const debug = debugFactory('loopback:sequelize:datasource');
const queryLogging = debugFactory('loopback:sequelize:queries');

/**
 * Sequelize DataSource Class
 */
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
    const {config} = this;
    const {
      connector,
      file,
      schema,
      database,
      host,
      port,
      user,
      username,
      password,
    } = config;

    this.sequelizeConfig = {
      database,
      dialect: connector ? supportedConnectorMapping[connector] : undefined,
      storage: file,
      host,
      port,
      schema,
      username: user ?? username,
      password,
      logging: queryLogging,
      pool: this.getPoolOptions(),
    };

    this.sequelize = new Sequelize(this.sequelizeConfig);

    await this.sequelize.authenticate();
    debug('Connection has been established successfully.');
  }
  async start(..._injectedArgs: unknown[]): Promise<void> {}
  async stop() {
    await this.sequelize?.close();
  }

  automigrate() {
    throw new Error(
      'SequelizeDataSourceError: Migrations are not supported. Use `db-migrate` package instead.',
    );
  }
  autoupdate() {
    throw new Error(
      'SequelizeDataSourceError: Migrations are not supported. Use `db-migrate` package instead.',
    );
  }

  /**
   * Begin a new transaction.
   *
   * @param [options] Options {isolationLevel: '...'}
   * @returns A promise which resolves to a Sequelize Transaction object
   */
  async beginTransaction(
    options?: TransactionOptions | TransactionOptions['isolationLevel'],
  ): Promise<Transaction> {
    /**
     * Default Isolation level for transactions is `READ_COMMITTED`, to be consistent with loopback default.
     * See: https://loopback.io/doc/en/lb4/Using-database-transactions.html#isolation-levels
     */
    const DEFAULT_ISOLATION_LEVEL = Transaction.ISOLATION_LEVELS.READ_COMMITTED;

    if (typeof options === 'string') {
      // Received `isolationLevel` as the first argument
      options = {
        isolationLevel: options,
      };
    } else if (options === undefined) {
      options = {
        isolationLevel: DEFAULT_ISOLATION_LEVEL,
      };
    } else {
      options.isolationLevel =
        options.isolationLevel ?? DEFAULT_ISOLATION_LEVEL;
    }

    return this.sequelize!.transaction(options);
  }
  getPoolOptions(): PoolOptions | undefined {
    const config: SequelizeDataSourceConfig = this.config;
    const specifiedPoolOptions = Object.keys(config).some(key =>
      poolConfigKeys.includes(key as LoopbackPoolConfigKey),
    );
    const supportsPooling =
      config.connector &&
      (poolingEnabledConnectors as string[]).includes(config.connector);

    if (!(supportsPooling && specifiedPoolOptions)) {
      return;
    }
    const optionMapping =
      ConnectionPoolOptions[config.connector as PoolingEnabledConnector];

    if (!optionMapping) {
      return;
    }

    const {min, max, acquire, idle} = optionMapping;
    const options: PoolOptions = {};
    if (max && config[max]) {
      options.max = config[max];
    }
    if (min && config[min]) {
      options.min = config[min];
    }
    if (acquire && config[acquire]) {
      options.acquire = config[acquire];
    }
    if (idle && config[idle]) {
      options.idle = config[idle];
    }
    return options;
  }
}

export type SequelizeDataSourceConfig = SequelizeOptions & {
  name?: string;
  user?: string;
  connector?: SupportedLoopbackConnectors;
  url?: string;
} & AnyObject;
