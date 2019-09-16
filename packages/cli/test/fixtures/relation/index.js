const DATASOURCE_APP_PATH = 'src/datasources';
const MODEL_APP_PATH = 'src/models';
const REPOSITORY_APP_PATH = 'src/repositories';
const CONTROLLER_PATH = 'src/controllers';
const CONFIG_PATH = '.';
const DUMMY_CONTENT = '--DUMMY VALUE--';
const fs = require('fs');

const SourceEntries = {
  CustomerModel: {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: readSourceFile('./models/customer.model.ts'),
  },
  CustomerModelWithOrdersProperty: {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: readSourceFile('./models/customer5.model.ts'),
  },
  CustomerRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'customer.repository.ts',
    content: readSourceFile('./repositories/customer.repository.ts'),
  },

  CustomerClassModel: {
    path: MODEL_APP_PATH,
    file: 'customer-class.model.ts',
    content: readSourceFile('./models/customer-class.model.ts'),
  },
  CustomerClassRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'customer-class.repository.ts',
    content: readSourceFile('./repositories/customer-class.repository.ts'),
  },

  CustomerClassTypeModel: {
    path: MODEL_APP_PATH,
    file: 'customer-class-type.model.ts',
    content: readSourceFile('./models/customer-class-type.model.ts'),
  },
  CustomerClassTypeRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'customer-class-type.repository.ts',
    content: readSourceFile('./repositories/customer-class-type.repository.ts'),
  },

  OrderModel: {
    path: MODEL_APP_PATH,
    file: 'order.model.ts',
    content: readSourceFile('./models/order.model.ts'),
  },
  OrderModelModelWithCustomerIdProperty: {
    path: MODEL_APP_PATH,
    file: 'order.model.ts',
    content: readSourceFile('./models/order-with-fk.model.ts'),
  },
  OrderRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'order.repository.ts',
    content: readSourceFile('./repositories/order.repository.ts'),
  },

  OrderClassModel: {
    path: MODEL_APP_PATH,
    file: 'order-class.model.ts',
    content: readSourceFile('./models/order-class.model.ts'),
  },
  OrderClassRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'order-class.repository.ts',
    content: readSourceFile('./repositories/order-class.repository.ts'),
  },

  OrderClassTypeModel: {
    path: MODEL_APP_PATH,
    file: 'order-class-type.model.ts',
    content: readSourceFile('./models/order-class-type.model.ts'),
  },
  OrderClassTypeRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'order-class-type.repository.ts',
    content: readSourceFile('./repositories/order-class-type.repository.ts'),
  },

  NoKeyModel: {
    path: MODEL_APP_PATH,
    file: 'nokey.model.ts',
    content: readSourceFile('./models/nokey.model.ts'),
  },

  IndexOfControllers: {
    path: CONTROLLER_PATH,
    file: 'index.ts',
    content: readSourceFile('./controllers/index.ts'),
  },
};
exports.SourceEntries = SourceEntries;

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
  SourceEntries.CustomerRepository,
  SourceEntries.OrderRepository,
  SourceEntries.CustomerClassRepository,
  SourceEntries.OrderClassRepository,
  SourceEntries.CustomerClassTypeRepository,
  SourceEntries.OrderClassTypeRepository,
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: DUMMY_CONTENT,
  },
  SourceEntries.CustomerModel,
  SourceEntries.OrderModel,
  SourceEntries.NoKeyModel,
  SourceEntries.CustomerClassModel,
  SourceEntries.OrderClassModel,
  SourceEntries.CustomerClassTypeModel,
  SourceEntries.OrderClassTypeModel,
];

exports.SANDBOX_FILES2 = [
  SourceEntries.CustomerRepository,
  SourceEntries.OrderRepository,
  SourceEntries.CustomerClassRepository,
  SourceEntries.OrderClassRepository,
  SourceEntries.CustomerClassTypeRepository,
  SourceEntries.OrderClassTypeRepository,

  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: DUMMY_CONTENT,
  },

  SourceEntries.CustomerModel,
  SourceEntries.OrderModel,
  SourceEntries.NoKeyModel,
  SourceEntries.CustomerClassModel,
  SourceEntries.OrderClassModel,
  SourceEntries.CustomerClassTypeModel,

  SourceEntries.IndexOfControllers,
];

exports.SANDBOX_FILES4 = [
  {
    path: CONTROLLER_PATH,
    file: 'order-customer.controller.ts',
    content: readSourceFile('./controllers/order-customer.controller.ts'),
  },
  {
    path: CONTROLLER_PATH,
    file: 'index.ts',
    content: readSourceFile('./controllers/index4.ts'),
  },
  SourceEntries.CustomerModel,
  SourceEntries.OrderModel,
  SourceEntries.CustomerRepository,
  SourceEntries.OrderRepository,
];

function readSourceFile(relativePath) {
  return fs.readFileSync(require.resolve(relativePath), {encoding: 'utf-8'});
}
