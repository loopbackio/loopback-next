// Copyright LoopBack contributors 2022. All Rights Reserved.
// Node module: @loopback/sequelize
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Dialect as AllSequelizeDialects, PoolOptions} from 'sequelize';

export type SupportedLoopbackConnectors =
  | 'mysql'
  | 'postgresql'
  | 'oracle'
  | 'sqlite3'
  | 'db2'
  | 'mssql';
/**
 * @key Loopback connectors name supported by this extension
 * @value Equivalent Dialect in Sequelize
 */
export const SupportedConnectorMapping: {
  [key in SupportedLoopbackConnectors]?: AllSequelizeDialects;
} = {
  mysql: 'mysql',
  postgresql: 'postgres',
  oracle: 'oracle',
  sqlite3: 'sqlite',
  db2: 'db2',
  mssql: 'mssql',
};

/**
 * Loopback uses different keys for pool options depending on the connector.
 */
export const poolConfigKeys = [
  // mysql
  'connectionLimit',
  'acquireTimeout',
  // postgresql
  'min',
  'max',
  'idleTimeoutMillis',
  // oracle
  'minConn',
  'maxConn',
  'timeout',
] as const;
export type LoopbackPoolConfigKey = (typeof poolConfigKeys)[number];

export type PoolingEnabledConnector = Exclude<
  SupportedLoopbackConnectors,
  'db2' | 'sqlite3'
>;

export const poolingEnabledConnectors: PoolingEnabledConnector[] = [
  'mysql',
  'oracle',
  'postgresql',
];

type IConnectionPoolOptions = {
  [connectorName in PoolingEnabledConnector]?: {
    [sequelizePoolOption in keyof PoolOptions]: LoopbackPoolConfigKey;
  };
};

export const ConnectionPoolOptions: IConnectionPoolOptions = {
  mysql: {
    max: 'connectionLimit',
    acquire: 'acquireTimeout',
  },
  postgresql: {
    min: 'min',
    max: 'max',
    idle: 'idleTimeoutMillis',
  },
  oracle: {
    min: 'minConn',
    max: 'maxConn',
    idle: 'timeout',
  },
};
