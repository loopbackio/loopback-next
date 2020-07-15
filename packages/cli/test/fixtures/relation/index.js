// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const DATASOURCE_APP_PATH = 'src/datasources';
const MODEL_APP_PATH = 'src/models';
const REPOSITORY_APP_PATH = 'src/repositories';
const CONTROLLER_PATH = 'src/controllers';
const CONFIG_PATH = '.';
const fs = require('fs');
const {getSourceForDataSourceClassWithConfig} = require('../../test-utils');

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
  CustomerModelWithAddressProperty: {
    path: MODEL_APP_PATH,
    file: 'customer.model.ts',
    content: readSourceFile('./models/customer6.model.ts'),
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

  AddressModel: {
    path: MODEL_APP_PATH,
    file: 'address.model.ts',
    content: readSourceFile('./models/address.model.ts'),
  },
  AddressModelWithCustomerIdProperty: {
    path: MODEL_APP_PATH,
    file: 'address.model.ts',
    content: readSourceFile('./models/address-with-fk.model.ts'),
  },
  AddressRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'address.repository.ts',
    content: readSourceFile('./repositories/address.repository.ts'),
  },

  AddressClassModel: {
    path: MODEL_APP_PATH,
    file: 'address-class.model.ts',
    content: readSourceFile('./models/address-class.model.ts'),
  },
  AddressClassRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'address-class.repository.ts',
    content: readSourceFile('./repositories/address-class.repository.ts'),
  },

  AddressClassTypeModel: {
    path: MODEL_APP_PATH,
    file: 'address-class-type.model.ts',
    content: readSourceFile('./models/address-class-type.model.ts'),
  },
  AddressClassTypeRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'address-class-type.repository.ts',
    content: readSourceFile('./repositories/address-class-type.repository.ts'),
  },

  NoKeyModel: {
    path: MODEL_APP_PATH,
    file: 'no-key.model.ts',
    content: readSourceFile('./models/no-key.model.ts'),
  },

  NoKeyRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'no-key.repository.ts',
    content: readSourceFile('./repositories/no-key.repository.ts'),
  },

  NoRepoModel: {
    path: MODEL_APP_PATH,
    file: 'no-repo.model.ts',
    content: readSourceFile('./models/no-repo.model.ts'),
  },

  IndexOfControllers: {
    path: CONTROLLER_PATH,
    file: 'index.ts',
    content: readSourceFile('./controllers/index.ts'),
  },
  DoctorModel: {
    path: MODEL_APP_PATH,
    file: 'doctor.model.ts',
    content: readSourceFile('./models/doctor.model.ts'),
  },
  DoctorRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'doctor.repository.ts',
    content: readSourceFile('./repositories/doctor.repository.ts'),
  },
  PatientModel: {
    path: MODEL_APP_PATH,
    file: 'patient.model.ts',
    content: readSourceFile('./models/patient.model.ts'),
  },
  PatientRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'patient.repository.ts',
    content: readSourceFile('./repositories/patient.repository.ts'),
  },
  AppointmentModel: {
    path: MODEL_APP_PATH,
    file: 'appointment.model.ts',
    content: readSourceFile('./models/appointment.model.ts'),
  },
  AppointmentRepository: {
    path: REPOSITORY_APP_PATH,
    file: 'appointment.repository.ts',
    content: readSourceFile('./repositories/appointment.repository.ts'),
  },
  DoctorPatientController: {
    path: CONTROLLER_PATH,
    file: 'doctor-patient.controller.ts',
    content: readSourceFile('./controllers/doctor-patient.controller.ts'),
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
    file: 'dbkv.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('DbkvDataSource', {
      name: 'dbkv',
      connector: 'kv-redis',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'my-ds.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('MyDsDataSource', {
      name: 'MyDS',
      connector: 'memory',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('RestdbDataSource', {
      name: 'restdb',
      connector: 'rest',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'sqlite3.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('Sqlite3DataSource', {
      name: 'sqlite3',
      connector: 'loopback-connector-sqlite3',
    }),
  },
  SourceEntries.CustomerRepository,
  SourceEntries.OrderRepository,
  SourceEntries.AddressRepository,
  SourceEntries.CustomerClassRepository,
  SourceEntries.OrderClassRepository,
  SourceEntries.AddressClassRepository,
  SourceEntries.CustomerClassTypeRepository,
  SourceEntries.OrderClassTypeRepository,
  SourceEntries.AddressClassTypeRepository,
  SourceEntries.NoKeyRepository,
  SourceEntries.DoctorRepository,
  SourceEntries.PatientRepository,
  SourceEntries.AppointmentRepository,

  SourceEntries.CustomerModel,
  SourceEntries.OrderModel,
  SourceEntries.AddressModel,
  SourceEntries.NoKeyModel,
  SourceEntries.NoRepoModel,
  SourceEntries.CustomerClassModel,
  SourceEntries.OrderClassModel,
  SourceEntries.AddressClassModel,
  SourceEntries.CustomerClassTypeModel,
  SourceEntries.OrderClassTypeModel,
  SourceEntries.AddressClassTypeModel,
  SourceEntries.DoctorModel,
  SourceEntries.PatientModel,
  SourceEntries.AppointmentModel,
  SourceEntries.DoctorPatientController,
];

exports.SANDBOX_FILES2 = [
  SourceEntries.CustomerRepository,
  SourceEntries.OrderRepository,
  SourceEntries.AddressRepository,
  SourceEntries.CustomerClassRepository,
  SourceEntries.OrderClassRepository,
  SourceEntries.AddressClassRepository,
  SourceEntries.CustomerClassTypeRepository,
  SourceEntries.OrderClassTypeRepository,
  SourceEntries.AddressClassTypeRepository,
  SourceEntries.NoKeyRepository,
  SourceEntries.DoctorRepository,
  SourceEntries.PatientRepository,
  SourceEntries.AppointmentRepository,

  SourceEntries.CustomerModel,
  SourceEntries.OrderModel,
  SourceEntries.AddressModel,
  SourceEntries.NoKeyModel,
  SourceEntries.NoRepoModel,
  SourceEntries.CustomerClassModel,
  SourceEntries.OrderClassModel,
  SourceEntries.AddressClassModel,
  SourceEntries.CustomerClassTypeModel,
  SourceEntries.DoctorModel,
  SourceEntries.PatientModel,
  SourceEntries.AppointmentModel,

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
