const DATASOURCE_APP_PATH = 'src/datasources';
const MODEL_APP_PATH = 'src/models';
const REPOSITORY_APP_PATH = 'src/repositories';
const CONTROLLER_PATH = 'src/controllers';
const CONFIG_PATH = '.';
const DUMMY_CONTENT = '--DUMMY VALUE--';
const fs = require('fs');

exports.SANDBOX_FILES = [
  {
    path: CONFIG_PATH,
    file: 'myconfig.json',
    content: JSON.stringify({
      datasource: 'dbmem',
      model: 'decoratordefined',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbkv.datasource.json',
    content: JSON.stringify({
      name: 'dbkv',
      connector: 'kv-redis',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbkv.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.json',
    content: JSON.stringify({
      name: 'dbmem',
      connector: 'memory',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'my-ds.datasource.json',
    content: JSON.stringify({
      name: 'MyDS',
      connector: 'memory',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.json',
    content: JSON.stringify({
      name: 'restdb',
      connector: 'rest',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'sqlite3.datasource.json',
    content: JSON.stringify({
      name: 'sqlite3',
      connector: 'loopback-connector-sqlite3',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'sqlite3.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer-class.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer-class.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order-class.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order-class.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },

  {
    path: REPOSITORY_APP_PATH,
    file: 'customer-class-type.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer-class-type.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order-class-type.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order-class-type.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: fs.readFileSync(require.resolve('./models/customer.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order.model.ts',
    content: fs.readFileSync(require.resolve('./models/order.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'nokey.model.ts',
    content: fs.readFileSync(require.resolve('./models/nokey.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'customer-class.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/customer-class.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order-class.model.ts',
    content: fs.readFileSync(require.resolve('./models/order-class.model.ts'), {
      encoding: 'utf-8',
    }),
  },

  {
    path: MODEL_APP_PATH,
    file: 'customer-class-type.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/customer-class-type.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order-class-type.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/order-class-type.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
];
exports.SANDBOX_FILES2 = [
  {
    path: CONTROLLER_PATH,
    file: 'customer.controller.ts',
    content: fs.readFileSync(
      require.resolve('./controllers/customer.controller.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer-class.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer-class.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order-class.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order-class.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },

  {
    path: REPOSITORY_APP_PATH,
    file: 'customer-class-type.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer-class-type.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order-class-type.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order-class-type.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: fs.readFileSync(require.resolve('./models/customer.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order.model.ts',
    content: fs.readFileSync(require.resolve('./models/order.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'nokey.model.ts',
    content: fs.readFileSync(require.resolve('./models/nokey.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'customer-class.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/customer-class.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order-class.model.ts',
    content: fs.readFileSync(require.resolve('./models/order-class.model.ts'), {
      encoding: 'utf-8',
    }),
  },

  {
    path: MODEL_APP_PATH,
    file: 'customer-class-type.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/customer-class-type.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order-class-type.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/order-class-type.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: CONTROLLER_PATH,
    file: 'index.ts',
    content: fs.readFileSync(require.resolve('./controllers/index.ts'), {
      encoding: 'utf-8',
    }),
  },
];

exports.SANDBOX_FILES3 = [];

exports.SANDBOX_FILES4 = [
  {
    path: CONTROLLER_PATH,
    file: 'order-customer.controller.ts',
    content: fs.readFileSync(
      require.resolve('./controllers/order-customer.controller.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: CONTROLLER_PATH,
    file: 'index.ts',
    content: fs.readFileSync(require.resolve('./controllers/index4.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: fs.readFileSync(require.resolve('./models/customer.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order.model.ts',
    content: fs.readFileSync(require.resolve('./models/order.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
];

exports.SANDBOX_FILES5 = [
  {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: fs.readFileSync(require.resolve('./models/customer5.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order.model.ts',
    content: fs.readFileSync(require.resolve('./models/order.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
];
exports.SANDBOX_FILES2 = [
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer-class.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer-class.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order-class.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order-class.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },

  {
    path: REPOSITORY_APP_PATH,
    file: 'customer-class-type.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer-class-type.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order-class-type.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order-class-type.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: fs.readFileSync(require.resolve('./models/customer.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order.model.ts',
    content: fs.readFileSync(require.resolve('./models/order.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'nokey.model.ts',
    content: fs.readFileSync(require.resolve('./models/nokey.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'customer-class.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/customer-class.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order-class.model.ts',
    content: fs.readFileSync(require.resolve('./models/order-class.model.ts'), {
      encoding: 'utf-8',
    }),
  },

  {
    path: MODEL_APP_PATH,
    file: 'customer-class-type.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/customer-class-type.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order-class-type.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/order-class-type.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: CONTROLLER_PATH,
    file: 'index.ts',
    content: fs.readFileSync(require.resolve('./controllers/index.ts'), {
      encoding: 'utf-8',
    }),
  },
];

exports.SANDBOX_FILES3 = [];

exports.SANDBOX_FILES4 = [
  {
    path: CONTROLLER_PATH,
    file: 'order-customer.controller.ts',
    content: fs.readFileSync(
      require.resolve('./controllers/order-customer.controller.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: CONTROLLER_PATH,
    file: 'index.ts',
    content: fs.readFileSync(require.resolve('./controllers/index4.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: fs.readFileSync(require.resolve('./models/customer.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order.model.ts',
    content: fs.readFileSync(require.resolve('./models/order.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
];

exports.SANDBOX_FILES6 = [
  {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: fs.readFileSync(require.resolve('./models/customer5.model.ts'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'order.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/order-with-fk.model.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'customer.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/customer.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'order.repository.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/order.repository.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
];
