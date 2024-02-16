import {LifeCycleObserver} from '@loopback/core';
import {
  AnyObject,
  Command,
  NamedParameters,
  Options,
  PositionalParameters,
} from '@loopback/repository';
import debugFactory from 'debug';
import {
  PoolOptions,
  QueryOptions,
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
      tns,
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
      dialectOptions: {
        connectString: tns, // oracle connect string
      },
      ...config.sequelizeOptions,
    };

    if (config.url) {
      this.sequelize = new Sequelize(config.url, this.sequelizeConfig);
    } else {
      this.sequelize = new Sequelize(this.sequelizeConfig);
    }
  }

  sequelize: Sequelize;
  sequelizeConfig: SequelizeOptions;

  /**
   * Gets the flag indicating whether to parse JSON columns.
   * If the `parseJsonColumns` property is set in the configuration, its value will be returned.
   * Otherwise, it returns `true` if the dialect is MySQL, `false` otherwise.
   *
   * @returns {boolean} The flag indicating whether to parse JSON columns.
   */
  get parseJsonColumns(): boolean {
    if (typeof this.config?.parseJsonColumns === 'boolean') {
      return this.config.parseJsonColumns;
    }

    return this.sequelizeConfig.dialect === 'mysql';
  }

  async init(): Promise<void> {
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

  /**
   * Execute a SQL command.
   *
   * **WARNING:** In general, it is always better to perform database actions
   * through repository methods. Directly executing SQL may lead to unexpected
   * results, corrupted data, security vulnerabilities and other issues.
   *
   * @example
   *
   * ```ts
   * // MySQL
   * const result = await db.execute(
   *   'SELECT * FROM Products WHERE size > ?',
   *   [42]
   * );
   *
   * // PostgreSQL
   * const result = await db.execute(
   *   'SELECT * FROM Products WHERE size > $1',
   *   [42]
   * );
   * ```
   *
   * @param command A parameterized SQL command or query.
   * @param parameters List of parameter values to use.
   * @param options Additional options, for example `transaction`.
   * @returns A promise which resolves to the command output. The output type (data structure) is database specific and
   * often depends on the command executed.
   */
  async execute(
    command: Command,
    parameters?: NamedParameters | PositionalParameters,
    options?: Options,
  ): Promise<AnyObject> {
    if (!this.sequelize) {
      throw Error(
        `The datasource "${this.name}" doesn't have sequelize instance bound to it.`,
      );
    }

    if (typeof command !== 'string') {
      command = JSON.stringify(command);
    }

    options = options ?? {};

    const queryOptions: QueryOptions = {};
    if (options?.transaction) {
      queryOptions.transaction = options.transaction;
    }

    let targetReplacementKey: 'replacements' | 'bind';

    // By default, we'll use 'bind'
    targetReplacementKey = 'bind';

    if (command.includes('?')) {
      // If command has '?', use 'replacements'
      targetReplacementKey = 'replacements';
    } else if (/\$\w/g.test(command)) {
      // If command has parameters starting with a dollar sign ($param or $1, $2), use 'bind'
      targetReplacementKey = 'bind';
    }

    if (parameters) {
      queryOptions[targetReplacementKey] = parameters;
    }
    const result = await this.sequelize.query(command, queryOptions);

    // Sequelize returns the select query result in an array at index 0 and at index 1 is the actual Result instance
    // Whereas in juggler it is returned directly as plain array.
    // Below condition maps that 0th index to final result to match juggler's behaviour
    if (command.match(/^(select|\(select)/i) && result.length >= 1) {
      return result[0];
    }

    return result;
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

export type SequelizeDataSourceConfig = {
  name?: string;
  user?: string;
  connector?: SupportedLoopbackConnectors;
  url?: string;
  /**
   * Whether or not to parse the JSON data stored in database columns.
   *
   * For dialects that do not support a native JSON type, we need to parse
   * string column values to JSON objects to preserve backwards compatibility with the Juggler ORM.
   * Example: https://github.com/loopbackio/loopback-connector-mysql/blob/edf176b09234b82796f925203ff006843e045498/lib/mysql.js#L476
   *
   * With Sequelize v6, some of the dialects like MariaDB and SQLite already parse JSON strings to JSON objects by default:
   * - https://github.com/sequelize/sequelize/blob/cb8ea88c9aa37b14c908fd34dff1afc603de2ea7/src/dialects/mariadb/query.js#L191
   * - https://github.com/sequelize/sequelize/blob/cb8ea88c9aa37b14c908fd34dff1afc603de2ea7/src/dialects/sqlite/query.js#L365
   *
   * Defaults to true for MySQL and false for other dialects.
   */
  parseJsonColumns?: boolean;

  /**
   * Additional sequelize options that are passed directly to
   * Sequelize when initializing the connection.
   * Any options provided in this way will take priority over
   * other configurations that may come from parsing the loopback style configurations.
   *
   * eg.
   * ```ts
   * let config = {
   *   name: 'db',
   *   connector: 'postgresql',
   *   sequelizeOptions: {
   *      dialectOptions: {
   *        rejectUnauthorized: false,
   *        ca: fs.readFileSync('/path/to/root.crt').toString(),
   *      }
   *   }
   * };
   * ```
   */
  sequelizeOptions?: SequelizeOptions;
} & AnyObject;
