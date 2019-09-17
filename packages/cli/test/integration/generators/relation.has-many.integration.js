// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const {expect, TestSandbox} = require('@loopback/testlab');

const generator = path.join(__dirname, '../../../generators/relation');
const {SANDBOX_FILES, SourceEntries} = require('../../fixtures/relation');
const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const MODEL_APP_PATH = 'src/models';
const CONTROLLER_PATH = 'src/controllers';
const REPOSITORY_APP_PATH = 'src/repositories';

const sandbox = new TestSandbox(SANDBOX_PATH);

const hasManyrImportRegEx = /import \{Entity, model, property, hasMany\} from '@loopback\/repository';\n/;
const sourceFileName = [
  'customer.model.ts',
  'customer-class.model.ts',
  'customer-class-type.model.ts',
];
const targetFileName = [
  'order.model.ts',
  'order-class.model.ts',
  'order-class-type.model.ts',
];
const controllerFileName = [
  'customer-order.controller.ts',
  'customer-class-order-class.controller.ts',
  'customer-class-type-order-class-type.controller.ts',
];
const repositoryFileName = [
  'customer.repository.ts',
  'customer-class.repository.ts',
  'customer-class-type.repository.ts',
];

describe('lb4 relation HasMany', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  it("rejects relation when source model doesn't have primary Key", async () => {
    await sandbox.reset();

    const prompt = {
      relationType: 'hasMany',
      sourceModel: 'Nokey',
      destinationModel: 'Customer',
    };

    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(prompt),
    ).to.be.rejectedWith(/Source model primary key does not exist\./);
  });

  it('rejects relation when relation already exist in the model', async () => {
    await sandbox.reset();

    const prompt = {
      relationType: 'hasMany',
      sourceModel: 'Customer',
      destinationModel: 'Order',
    };

    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: [
              SourceEntries.CustomerModelWithOrdersProperty,
              SourceEntries.OrderModel,
              SourceEntries.CustomerRepository,
              SourceEntries.OrderRepository,
            ],
          }),
        )
        .withPrompts(prompt),
    ).to.be.rejectedWith(
      /relational property orders already exist in the model Customer/,
    );
  });

  // special cases regardless of the repository type
  context('generate model relation', () => {
    const promptArray = [
      {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
      },
    ];

    const expectedImport = [
      /import \{Order\} from '\.\/order\.model';\n/,
      /import \{OrderClass\} from '\.\/order-class\.model';\n/,
      /import \{OrderClassType\} from '\.\/order-class-type\.model';\n/,
    ];
    const expectedDecoretor = [
      /\@hasMany\(\(\) => Order\)\n {2}orders: Order\[\];\n/,
      /\@hasMany\(\(\) => OrderClass ,\{keyTo: 'customerClassCustNumber'\}\)/,
      /\@hasMany\(\(\) => OrderClassType ,\{keyTo: 'customerClassTypeCustNumber'\}\)/,
    ];

    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('add import hasMany, import for target model and hasMany decorator  ', async () => {
        const expectedSourceFile = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[i],
        );

        assert.file(expectedSourceFile);
        assert.fileContent(expectedSourceFile, hasManyrImportRegEx);
        assert.fileContent(expectedSourceFile, expectedImport[i]);

        assert.fileContent(expectedSourceFile, expectedDecoretor[i]);
      });
    }
  });

  context('generate model relation with custom relation name', () => {
    const promptArray = [
      {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
        relationName: 'myOrders',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
        relationName: 'myOrders',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
        relationName: 'myOrders',
      },
    ];

    const expectedImport = [
      /import \{Order\} from '\.\/order\.model';\n/,
      /import \{OrderClass\} from '\.\/order-class\.model';\n/,
      /import \{OrderClassType\} from '\.\/order-class-type\.model';\n/,
    ];
    const expectedDecoretor = [
      /\@hasMany\(\(\) => Order\)\n {2}myOrders: Order\[\];\n/,
      /\@hasMany\(\(\) => OrderClass ,\{keyTo: 'customerClassCustNumber'\}\)/,
      /\@hasMany\(\(\) => OrderClassType ,\{keyTo: 'customerClassTypeCustNumber'\}\)/,
    ];
    const expectedProperty = [
      /@property\(\{\n {4}type: 'number',\n {2}\}\)\n {2}customerId\?\: number;\n/,
      /@property\(\{\n {4}type: 'number',\n {2}\}\)\n {2}customerClassCustNumber\?\: number;\n/,
      /@property\(\{\n {4}type: 'number',\n {2}\}\)\n {2}customerClassTypeCustNumber\?\: number;\n/,
    ];

    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('relation name should be myOrders', async () => {
        const expectedSourceFile = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[i],
        );
        const expectedTargetFile = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          targetFileName[i],
        );

        assert.file(expectedSourceFile);
        assert.fileContent(expectedSourceFile, hasManyrImportRegEx);

        assert.fileContent(expectedSourceFile, expectedImport[i]);

        assert.fileContent(expectedSourceFile, expectedDecoretor[i]);

        assert.fileContent(expectedTargetFile, expectedProperty[i]);
      });
    }
  });

  context('generate model relation with custom foreignKey', () => {
    const promptArray = [
      {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
        foreignKeyName: 'mykey',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
        foreignKeyName: 'mykey',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
        foreignKeyName: 'mykey',
      },
    ];

    const expectedImport = [
      /import \{Order\} from '\.\/order\.model';\n/,
      /import \{OrderClass\} from '\.\/order-class\.model';\n/,
      /import \{OrderClassType\} from '\.\/order-class-type\.model';\n/,
    ];
    const expectedDecoretor = [
      /\@hasMany\(\(\) => Order ,\{keyTo: 'mykey'\}\)\n {2}orders: Order\[\];\n/,
      /\@hasMany\(\(\) => OrderClass ,\{keyTo: 'mykey'\}\)\n {2}orderClasses: OrderClass\[\];\n/,
      /\@hasMany\(\(\) => OrderClassType ,\{keyTo: 'mykey'\}\)\n {2}orderClassTypes: OrderClassType\[\];\n/,
    ];
    const expectedProperty = /@property\(\{\n {4}type: 'number',\n {2}\}\)\n {2}mykey\?\: number;\n/;

    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('add the keyTo to the source model', async () => {
        const expectedSourceFile = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[i],
        );
        const expectedTargetFile = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          targetFileName[i],
        );

        assert.file(expectedSourceFile);
        assert.fileContent(expectedSourceFile, hasManyrImportRegEx);

        assert.fileContent(expectedSourceFile, expectedImport[i]);

        assert.fileContent(expectedSourceFile, expectedDecoretor[i]);

        assert.fileContent(expectedTargetFile, expectedProperty);
      });
    }
  });

  context('generate model relation with default relation name', () => {
    const promptArray = [
      {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
      },
    ];

    const expectedDecoretor = [
      /\@hasMany\(\(\) => Order\)\n {2}orders: Order\[\];\n/,
      /\@hasMany\(\(\) => OrderClass ,\{keyTo: 'customerClassCustNumber'\}\)\n/,
      /\@hasMany\(\(\) => OrderClassType ,\{keyTo: 'customerClassTypeCustNumber'\}\)\n/,
    ];
    const defaultRelationName = ['orders', 'orderClasses', 'orderClassTypes'];
    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      it('relation name should be ' + defaultRelationName[i], async () => {
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);

        const expectedSourceFile = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[i],
        );

        assert.fileContent(expectedSourceFile, expectedDecoretor[i]);
      });
    }
  });

  context('check if the controller file created ', () => {
    const promptArray = [
      {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
      },
    ];
    const controllerClass = [
      /class CustomerOrderController/,
      /class CustomerClassOrderClassController/,
      /class CustomerClassTypeOrderClassTypeController/,
    ];
    const controllerConstructor = [
      /constructor\(\n {4}\@repository\(CustomerRepository\) protected customerRepository: CustomerRepository,\n {2}\) \{ \}\n/,
      /constructor\(\n {4}\@repository\(CustomerClassRepository\) protected customerClassRepository: CustomerClassRepository,\n {2}\) \{ \}\n/,
      /constructor\(\n {4}\@repository\(CustomerClassTypeRepository\) protected customerClassTypeRepository: CustomerClassTypeRepository,\n {2}\) \{ \}\n/,
    ];

    const indexExport = [
      /export \* from '\.\/customer-order\.controller';/,
      /export \* from '\.\/customer-class-order-class\.controller';/,
      /export \* from '\.\/customer-class-type-order-class-type\.controller';/,
    ];
    const sourceClassnames = ['Customer', 'CustomerClass', 'CustomerClassType'];
    const targetClassnames = ['Order', 'OrderClass', 'OrderClassType'];

    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('new controller file created', async () => {
        const expectedControllerFile = path.join(
          SANDBOX_PATH,
          CONTROLLER_PATH,
          controllerFileName[i],
        );
        assert.file(expectedControllerFile);
      });

      it('controller with hasMany class and constructor', async () => {
        const expectedControllerFile = path.join(
          SANDBOX_PATH,
          CONTROLLER_PATH,
          controllerFileName[i],
        );
        assert.fileContent(expectedControllerFile, controllerClass[i]);
        assert.fileContent(expectedControllerFile, controllerConstructor[i]);
      });

      it('the new controller file added to index.ts file', async () => {
        const expectedControllerIndexFile = path.join(
          SANDBOX_PATH,
          CONTROLLER_PATH,
          'index.ts',
        );

        assert.fileContent(expectedControllerIndexFile, indexExport[i]);
      });

      it(
        'controller GET Array of ' +
          targetClassnames[i] +
          "'s belonging to " +
          sourceClassnames[i],
        async () => {
          const getOrdersByCustomerIdRegEx = [
            /\@get\('\/customers\/{id}\/orders', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'Array of Order\\'s belonging to Customer',\n/,
            /content: {\n {10}'application\/json': {\n/,
            /schema: {type: 'array', items: getModelSchemaRef\(Order\)},/,
            /},\n . {6}},\n . {4}},\n . {2}},\n {2}}\)\n/,
            /async find\(\n . {2}\@param.path.number\('id'\) id: number,\n/,
            /\@param.query.object\('filter'\) filter\?: Filter<Order>,\n/,
            /\)\: Promise<Order\[]> {\n/,
            /return this\.customerRepository\.orders\(id\)\.find\(filter\);\n {2}}\n/,
          ];
          const getOrdersClassByCustomerClassIdRegEx = [
            /\@get\('\/customer-classes\/{id}\/order-classes', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'Array of OrderClass\\'s belonging to CustomerClass',\n/,
            /content: {\n {10}'application\/json': {\n/,
            /schema: {type: 'array', items: getModelSchemaRef\(OrderClass\)},/,
            /},\n . {6}},\n . {4}},\n . {2}},\n {2}}\)\n/,
            /async find\(\n . {2}\@param.path.number\('id'\) id: number,\n/,
            /\@param.query.object\('filter'\) filter\?: Filter<OrderClass>,\n/,
            /\)\: Promise<OrderClass\[]> {\n/,
            /return this\.customerClassRepository\.orderClasses\(id\)\.find\(filter\);\n {2}}\n/,
          ];
          const getOrdersClassTypeByCustomerClassTypeIdRegEx = [
            /\@get\('\/customer-class-types\/{id}\/order-class-types', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'Array of OrderClassType\\'s belonging to CustomerClassType',\n/,
            /content: {\n {10}'application\/json': {\n/,
            /schema: {type: 'array', items: getModelSchemaRef\(OrderClassType\)},/,
            /},\n . {6}},\n . {4}},\n . {2}},\n {2}}\)\n/,
            /async find\(\n . {2}\@param.path.number\('id'\) id: number,\n/,
            /\@param.query.object\('filter'\) filter\?: Filter<OrderClassType>,\n/,
            /\)\: Promise<OrderClassType\[]> {\n/,
            /return this\.customerClassTypeRepository\.orderClassTypes\(id\).find\(filter\);\n {2}}\n/,
          ];

          const getRegEx = [
            getOrdersByCustomerIdRegEx,
            getOrdersClassByCustomerClassIdRegEx,
            getOrdersClassTypeByCustomerClassTypeIdRegEx,
          ];

          const expectedControllerFile = path.join(
            SANDBOX_PATH,
            CONTROLLER_PATH,
            controllerFileName[i],
          );
          getRegEx[i].forEach(regex => {
            assert.fileContent(expectedControllerFile, regex);
          });
        },
      );

      it(
        'controller POST ' + targetClassnames[i] + ' to ' + sourceClassnames[i],
        async () => {
          const postClassCreateRegEx = [
            /\@post\('\/customers\/{id}\/orders', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'Customer model instance',\n/,
            /content: {'application\/json': {schema: getModelSchemaRef\(Order\)}},\n/,
            /},\n . {2}},\n .}\)\n {2}async create\(\n/,
            /\@param\.path\.number\('id'\) id: typeof Customer\.prototype\.id,\n/,
            /\@requestBody\(\{\s+content: {\s+'application\/json': {\s+schema: getModelSchemaRef\(Order, {\n/,
            /title: 'NewOrderInCustomer',\n/,
            /exclude: \['id'\],\n/,
            /optional: \['customerId'\]\n/,
            /}\),\s+},\s+},\s+}\) order: Omit<Order, 'id'>,\n/,
            /\): Promise<Order> {\n/,
            /return this\.customerRepository\.orders\(id\)\.create\(order\);\n {2}}\n/,
          ];
          const postMultiWordClassCreateRegEx = [
            /\@post\('\/customer-classes\/{id}\/order-classes', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'CustomerClass model instance',\n/,
            /content: {'application\/json': {schema: getModelSchemaRef\(OrderClass\)}},\n/,
            /},\n . {2}},\n .}\)\n {2}async create\(\n/,
            /\@param\.path\.number\('id'\) id: typeof CustomerClass\.prototype\.custNumber,\n/,
            /\@requestBody\(\{\s+content: {\s+'application\/json': {\s+schema: getModelSchemaRef\(OrderClass, {\n/,
            /title: 'NewOrderClassInCustomerClass',\n/,
            /exclude: \['orderNumber'\],\n/,
            /optional: \['customerClassCustNumber'\]\n/,
            /}\),\s+},\s+},\s+}\) orderClass: Omit<OrderClass, 'orderNumber'>,\n/,
            /\): Promise<OrderClass> {\n/,
            /return this\.customerClassRepository\.orderClasses\(id\)\.create\(orderClass\);\n {2}}\n/,
          ];
          const postTypeClassCreateRegEx = [
            /\@post\('\/customer-class-types\/{id}\/order-class-types', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'CustomerClassType model instance',\n/,
            /content: {'application\/json': {schema: getModelSchemaRef\(OrderClassType\)}},\n/,
            /},\n . {2}},\n .}\)\n {2}async create\(\n/,
            /\@param\.path\.number\('id'\) id: typeof CustomerClassType\.prototype\.custNumber,\n/,
            /\@requestBody\(\{\s+content: {\s+'application\/json': {\s+schema: getModelSchemaRef\(OrderClassType, {\n/,
            /title: 'NewOrderClassTypeInCustomerClassType',\n/,
            /exclude: \['orderString'\],\n/,
            /optional: \['customerClassTypeCustNumber'\]\n/,
            /}\),\s+},\s+},\s+}\) orderClassType: Omit<OrderClassType, 'orderString'>,\n/,
            /\): Promise<OrderClassType> {\n/,
            /return this\.customerClassTypeRepository\.orderClassTypes\(id\)\.create\(orderClassType\);\n {2}}\n/,
          ];

          const expectedControllerFile = path.join(
            SANDBOX_PATH,
            CONTROLLER_PATH,
            controllerFileName[i],
          );

          const postRegEx = [
            postClassCreateRegEx,
            postMultiWordClassCreateRegEx,
            postTypeClassCreateRegEx,
          ];

          postRegEx[i].forEach(regex => {
            assert.fileContent(expectedControllerFile, regex);
          });
        },
      );

      it(
        'controller ' +
          targetClassnames[i] +
          ' PATCH by ' +
          sourceClassnames[i] +
          ' id',
        async () => {
          const updateOrderByCustomerIdRegEx = [
            /\@patch\('\/customers\/{id}\/orders', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'Customer.Order PATCH success count',\n/,
            /content: {'application\/json': {schema: CountSchema}},\n/,
            /},\n {4}},\n {2}}\)\n {2}async patch\(\n/,
            /\@param\.path\.number\('id'\) id: number,\n {4}/,
            /\@requestBody\({\s+content: {\s+'application\/json': {\s+schema: getModelSchemaRef\(Order, {partial: true}\),\s+},\s+},\s+}\)\s+order: Partial<Order>,\n/,
            /\@param\.query\.object\('where', getWhereSchemaFor\(Order\)\) where\?: Where<Order>,\n/,
            /\): Promise<Count> {\n/,
            /return this\.customerRepository\.orders\(id\).patch\(order, where\);\n {2}}\n/,
          ];

          const updateOrderClassByCustomerClassIdRegEx = [
            /\@patch\('\/customer-classes\/{id}\/order-classes', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'CustomerClass.OrderClass PATCH success count',\n/,
            /content: {'application\/json': {schema: CountSchema}},\n/,
            /},\n {4}},\n {2}}\)\n {2}async patch\(\n/,
            /\@param\.path\.number\('id'\) id: number,\n {4}/,
            /\@requestBody\({\s+content: {\s+'application\/json': {\s+schema: getModelSchemaRef\(OrderClass, {partial: true}\),\s+},\s+},\s+}\)\s+orderClass: Partial<OrderClass>,\n/,
            /\@param\.query\.object\('where', getWhereSchemaFor\(OrderClass\)\) where\?: Where<OrderClass>,\n/,
            /\): Promise<Count> {\n/,
            /return this\.customerClassRepository\.orderClasses\(id\)\.patch\(orderClass, where\);\n {2}}\n/,
          ];

          const updateOrderClassByCustomerClassTypeIdRegEx = [
            /\@patch\('\/customer-class-types\/{id}\/order-class-types', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'CustomerClassType.OrderClassType PATCH success count',\n/,
            /content: {'application\/json': {schema: CountSchema}},\n/,
            /},\n {4}},\n {2}}\)\n {2}async patch\(\n/,
            /\@param\.path\.number\('id'\) id: number,\n {4}/,
            /\@requestBody\({\s+content: {\s+'application\/json': {\s+schema: getModelSchemaRef\(OrderClassType, {partial: true}\),\s+},\s+},\s+}\)\s+orderClassType: Partial<OrderClassType>,\n/,
            /\@param\.query\.object\('where', getWhereSchemaFor\(OrderClassType\)\) where\?: Where<OrderClassType>,\n/,
            /\): Promise<Count> {\n/,
            /return this\.customerClassTypeRepository\.orderClassTypes\(id\).patch\(orderClassType, where\);\n {2}}\n/,
          ];

          const expectedControllerFile = path.join(
            SANDBOX_PATH,
            CONTROLLER_PATH,
            controllerFileName[i],
          );

          const updateRegEx = [
            updateOrderByCustomerIdRegEx,
            updateOrderClassByCustomerClassIdRegEx,
            updateOrderClassByCustomerClassTypeIdRegEx,
          ];

          updateRegEx[i].forEach(regex => {
            assert.fileContent(expectedControllerFile, regex);
          });
        },
      );

      it(
        'controller ' +
          targetClassnames[i] +
          ' DELETE by ' +
          sourceClassnames[i] +
          ' id',
        async () => {
          const deleteOrderByCustomerIdRegEx = [
            /\@del\('\/customers\/{id}\/orders', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'Customer.Order DELETE success count',\n/,
            /content: {'application\/json': {schema: CountSchema}},\n/,
            /},\n {4}},\n {2}}\)\n {2}async delete\(\n/,
            /\@param\.path\.number\('id'\) id: number,\n /,
            /\@param\.query\.object\('where', getWhereSchemaFor\(Order\)\) where\?: Where<Order>,\n/,
            /\): Promise<Count> {\n/,
            /return this\.customerRepository\.orders\(id\)\.delete\(where\);\n {2}}\n}\n/,
          ];

          const deleteOrderClassByCustomerClassIdRegEx = [
            /\@del\('\/customer-classes\/{id}\/order-classes', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'CustomerClass.OrderClass DELETE success count',\n/,
            /content: {'application\/json': {schema: CountSchema}},\n/,
            /},\n {4}},\n {2}}\)\n {2}async delete\(\n/,
            /\@param\.path\.number\('id'\) id: number,\n /,
            /\@param\.query\.object\('where', getWhereSchemaFor\(OrderClass\)\) where\?: Where<OrderClass>,\n/,
            /\): Promise<Count> {\n/,
            /return this\.customerClassRepository\.orderClasses\(id\)\.delete\(where\);\n {2}}\n}\n/,
          ];

          const deleteOrderClassTypeByCustomerClassTypeIdRegEx = [
            /\@del\('\/customer-class-types\/{id}\/order-class-types', {\n {4}responses: {\n {6}'200': {\n/,
            /description: 'CustomerClassType.OrderClassType DELETE success count',\n/,
            /content: {'application\/json': {schema: CountSchema}},\n/,
            /},\n {4}},\n {2}}\)\n {2}async delete\(\n/,
            /\@param\.path\.number\('id'\) id: number,\n /,
            /\@param\.query\.object\('where', getWhereSchemaFor\(OrderClassType\)\) where\?: Where<OrderClassType>,\n/,
            /\): Promise<Count> {\n/,
            /return this\.customerClassTypeRepository\.orderClassTypes\(id\)\.delete\(where\);\n {2}}\n}\n/,
          ];

          const expectedControllerFile = path.join(
            SANDBOX_PATH,
            CONTROLLER_PATH,
            controllerFileName[i],
          );

          const deleteRegEx = [
            deleteOrderByCustomerIdRegEx,
            deleteOrderClassByCustomerClassIdRegEx,
            deleteOrderClassTypeByCustomerClassTypeIdRegEx,
          ];

          deleteRegEx[i].forEach(regex => {
            assert.fileContent(expectedControllerFile, regex);
          });
        },
      );
    }
  });

  context('check source class repository ', () => {
    const promptArray = [
      {
        relationType: 'hasMany',
        sourceModel: 'Customer',
        destinationModel: 'Order',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClass',
        destinationModel: 'OrderClass',
      },
      {
        relationType: 'hasMany',
        sourceModel: 'CustomerClassType',
        destinationModel: 'OrderClassType',
      },
    ];

    const sourceClassnames = ['Customer', 'CustomerClass', 'CustomerClassType'];
    promptArray.forEach(function(multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it(sourceClassnames[i] + ' repository has all imports', async () => {
        const repositoryBasicImports = [
          /repository, HasManyRepositoryFactory} from '\@loopback\/repository';\n/,
          /import \{inject, Getter\} from '\@loopback\/core';/,
        ];

        const repositoryClassImport = [
          /import \{OrderRepository\} from '\.\/order\.repository';/,
          /import \{Customer, Order\} from '\.\.\/models';/,
        ];
        const repositoryMultiWordClassImport = [
          /import \{OrderClassRepository\} from '\.\/order-class\.repository';/,
          /import \{CustomerClass, OrderClass\} from '\.\.\/models';/,
        ];
        const repositoryTypeClassImport = [
          /import \{OrderClassTypeRepository\} from '\.\/order-class-type\.repository';/,
          /import \{CustomerClassType, OrderClassType\} from '\.\.\/models';/,
        ];

        const sourceRepositoryFile = path.join(
          SANDBOX_PATH,
          REPOSITORY_APP_PATH,
          repositoryFileName[i],
        );

        repositoryBasicImports.forEach(regex => {
          assert.fileContent(sourceRepositoryFile, regex);
        });

        const importRegEx = [
          repositoryClassImport,
          repositoryMultiWordClassImport,
          repositoryTypeClassImport,
        ];

        importRegEx[i].forEach(regex => {
          assert.fileContent(sourceRepositoryFile, regex);
        });
      });

      it('repository has updated constructor', async () => {
        const singleWordClassConstractor = [
          /public readonly orders: HasManyRepositoryFactory<Order, typeof Customer\.prototype\.id>;\n/,
          /constructor\(\@inject\('datasources\.db'\) dataSource: DbDataSource, \@repository\.getter\('OrderRepository'\) protected orderRepositoryGetter: Getter<OrderRepository>,\) \{\n/,
          /super\(Customer, dataSource\);\n {4}this.orders = this.createHasManyRepositoryFactoryFor\('orders', orderRepositoryGetter,\);\n {2}\}\n/,
        ];

        const multiWordClassConstractor = [
          /public readonly orderClasses: HasManyRepositoryFactory<OrderClass, typeof CustomerClass\.prototype\.custNumber>;\n/,
          /constructor\(\@inject\('datasources\.myDB'\) dataSource: MyDBDataSource, \@repository\.getter\('OrderClassRepository'\) protected orderClassRepositoryGetter: Getter<OrderClassRepository>,\) \{\n/,
          /super\(CustomerClass, dataSource\);\n {4}this\.orderClasses = this\.createHasManyRepositoryFactoryFor\('orderClasses', orderClassRepositoryGetter,\);\n {2}\}\n/,
        ];
        const typeClassConstractor = [
          /public readonly orderClassTypes: HasManyRepositoryFactory<OrderClassType, typeof CustomerClassType\.prototype\.custNumber>;\n/,
          /constructor\(@inject\('datasources\.myDB'\) dataSource: MyDBDataSource, @repository\.getter\('OrderClassTypeRepository'\) protected orderClassTypeRepositoryGetter: Getter<OrderClassTypeRepository>,\) \{\n/,
          /super\(CustomerClassType, dataSource\);\n {4}this\.orderClassTypes = this\.createHasManyRepositoryFactoryFor\('orderClassTypes', orderClassTypeRepositoryGetter,\);\n {2}\}/,
        ];

        const sourceRepositoryFile = path.join(
          SANDBOX_PATH,
          REPOSITORY_APP_PATH,
          repositoryFileName[i],
        );

        const updateConstructorRegEx = [
          singleWordClassConstractor,
          multiWordClassConstractor,
          typeClassConstractor,
        ];
        updateConstructorRegEx[i].forEach(regex => {
          assert.fileContent(sourceRepositoryFile, regex);
        });
      });
    }
  });
});
