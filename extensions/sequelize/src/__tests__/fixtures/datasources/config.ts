import {SequelizeDataSourceConfig} from '../../../sequelize';

// sqlite3 is to be used while running tests in ci environment
// postgresql can be used for local development (to ensure all transaction test cases passes)
type AvailableConfig = Record<
  'postgresql' | 'sqlite3',
  SequelizeDataSourceConfig
>;

export const datasourceTestConfig: Record<
  'primary' | 'secondary' | 'url' | 'wrongPassword',
  AvailableConfig
> = {
  primary: {
    postgresql: {
      name: 'primary',
      connector: 'postgresql',
      host: 'localhost',
      port: 5001,
      user: 'postgres',
      password: 'super-secret',
      database: 'postgres',
    },
    sqlite3: {
      name: 'primary',
      host: '0.0.0.0',
      connector: 'sqlite3',
      database: 'transaction-primary',
      file: ':memory:',
    },
  },
  secondary: {
    postgresql: {
      name: 'secondary',
      connector: 'postgresql',
      host: 'localhost',
      port: 5002,
      user: 'postgres',
      password: 'super-secret',
      database: 'postgres',
    },
    sqlite3: {
      name: 'secondary',
      host: '0.0.0.0',
      connector: 'sqlite3',
      database: 'transaction-secondary',
      file: ':memory:',
    },
  },
  url: {
    postgresql: {
      name: 'using-url',
      connector: 'postgresql',
      url: 'postgres://postgres:super-secret@localhost:5002/postgres',
    },
    sqlite3: {
      name: 'using-url',
      url: 'sqlite::memory:',
    },
  },
  wrongPassword: {
    postgresql: {
      name: 'wrongPassword',
      connector: 'postgresql',
      url: 'postgres://postgres:super-secret-wrong@localhost:5002/postgres',
    },
    sqlite3: {
      name: 'wrongPassword',
      url: 'sqlite::memory:',
    },
  },
};
