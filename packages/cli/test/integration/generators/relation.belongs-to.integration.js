// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const {expect, TestSandbox} = require('@loopback/testlab');
const fs = require('fs');

const generator = path.join(__dirname, '../../../generators/relation');
const {SANDBOX_FILES, SourceEntries} = require('../../fixtures/relation');
const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const MODEL_APP_PATH = 'src/models';
const CONTROLLER_PATH = 'src/controllers';
const REPOSITORY_APP_PATH = 'src/repositories';
const sandbox = new TestSandbox(SANDBOX_PATH);

const sourceFileName = [
  'order.model.ts',
  'order-class.model.ts',
  'order-class-type.model.ts',
];
const controllerFileName = [
  'order-customer.controller.ts',
  'order-class-customer-class.controller.ts',
  'order-class-type-customer-class-type.controller.ts',
];
const repositoryFileName = [
  'order.repository.ts',
  'order-class.repository.ts',
  'order-class-type.repository.ts',
];

describe('lb4 relation', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(50000);

  it("rejects relation when destination model doesn't have primary Key", async () => {
    await sandbox.reset();
    const prompt = {
      relationType: 'belongsTo',
      sourceModel: 'Customer',
      destinationModel: 'Nokey',
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
    ).to.be.rejectedWith(/Target model primary key does not exist/);
  });

  it('rejects relation when models does not exist', async () => {
    await sandbox.reset();
    const prompt = {
      relationType: 'belongsTo',
      sourceModel: 'Customer',
      destinationModel: 'Nokey',
    };

    return expect(
      testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: [
              // no model/repository files in this project
            ],
          }),
        )
        .withPrompts(prompt),
    ).to.be.rejectedWith(/No models found/);
  });

  it('updates property decorator when property already exist in the model', async () => {
    await sandbox.reset();
    const prompt = {
      relationType: 'belongsTo',
      sourceModel: 'Order',
      destinationModel: 'Customer',
    };

    await testUtils
      .executeGenerator(generator)
      .inDir(SANDBOX_PATH, () =>
        testUtils.givenLBProject(SANDBOX_PATH, {
          additionalFiles: [
            SourceEntries.CustomerModelWithOrdersProperty,
            SourceEntries.OrderModelModelWithCustomerIdProperty,
            SourceEntries.CustomerRepository,
            SourceEntries.OrderRepository,
          ],
        }),
      )
      .withPrompts(prompt);

    const expectedFile = path.join(
      SANDBOX_PATH,
      MODEL_APP_PATH,
      'order.model.ts',
    );

    const relationalPropertyRegEx = /\@belongsTo\(\(\) \=\> Customer\)/;
    assert.fileContent(expectedFile, relationalPropertyRegEx);
  });

  context('generate model relation', () => {
    const expectedImport = /import {Entity, model, property, belongsTo} from \'\@loopback\/repository\';\n/;
    const expectedDecoretor = [
      /@belongsTo\(\(\) => Customer\)\n {2}myCustomer: number;\n/,
      /@belongsTo\(\(\) => CustomerClass\)\n {2}myCustomer: number;\n/,
      /@belongsTo\(\(\) => CustomerClassType\)\n {2}myCustomer: number;\n/,
    ];
    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
        relationName: 'myCustomer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
        relationName: 'myCustomer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
        relationName: 'myCustomer',
      },
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

      it('add import belongsTo, import for target model and belongsTo decorator  ', async () => {
        const expectedSourceFile = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[i],
        );

        assert.file(expectedSourceFile);
        assert.fileContent(expectedSourceFile, expectedImport);
        assert.fileContent(expectedSourceFile, expectedDecoretor[i]);
      });
    }
  });

  context('generate model relation with custom relation name', () => {
    const expectedDecoretor = [
      /@belongsTo\(\(\) => Customer\)\n {2}customerPK: number;\n/,
      /@belongsTo\(\(\) => CustomerClass\)\n {2}customerPK: number;\n/,
      /@belongsTo\(\(\) => CustomerClassType\)\n {2}customerPK: number;\n/,
    ];

    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
        relationName: 'customerPK',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
        relationName: 'customerPK',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
        relationName: 'customerPK',
      },
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

      it('relation name should be customerPK', async () => {
        const expectedSourceFile = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[i],
        );

        assert.fileContent(expectedSourceFile, expectedDecoretor[i]);
      });
    }
  });

  context('generate model relation with default relation name', () => {
    const expectedDecoretor = [
      /@belongsTo\(\(\) => Customer\)\n {2}customerId: number;\n/,
      /@belongsTo\(\(\) => CustomerClass\)\n {2}customerClassCustNumber: number;\n/,
      /@belongsTo\(\(\) => CustomerClassType\)\n {2}customerClassTypeCustNumber: number;\n/,
    ];
    const defaultRelationName = [
      'customerId',
      'customerClassCustNumber',
      'customerClassTypeCustNumber',
    ];

    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
      },
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

      it('relation name should be ' + defaultRelationName[i], async () => {
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
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
      },
    ];
    const controllerClass = [
      /class OrderCustomerController/,
      /class OrderClassCustomerClassController/,
      /class OrderClassTypeCustomerClassTypeController/,
    ];
    const controllerConstructor = [
      /constructor\(\n {4}\@repository\(OrderRepository\)\n {4}public orderRepository: OrderRepository,\n {2}\) \{ \}\n/,
      /constructor\(\n {4}\@repository\(OrderClassRepository\)\n {4}public orderClassRepository: OrderClassRepository,\n {2}\) \{ \}\n/,
      /constructor\(\n {4}\@repository\(OrderClassTypeRepository\)\n {4}public orderClassTypeRepository: OrderClassTypeRepository,\n {2}\) \{ \}\n/,
    ];
    const indexExport = [
      /export \* from '.\/order-customer.controller';/,
      /export \* from '.\/order-class-customer-class.controller';/,
      /export \* from '.\/order-class-type-customer-class-type.controller';/,
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

      it('controller with belongsTo class and constructor', async () => {
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
            /\@get\('\/orders\/{id}\/customer', \{\n {4}responses: \{\n {6}'200': \{\n/,
            /content: \{\n {10}'application\/json': \{\n/,
            /async getCustomer\(\n {4}\@param\.path\.number\('id'\) id: typeof Order\.prototype\.id,\n/,
            /\)\: Promise<Customer> \{\n/,
            /return this\.orderRepository\.customer\(id\);\n {2}\}\n/,
          ];
          const getOrdersClassByCustomerClassIdRegEx = [
            /\@get\('\/order-classes\/{id}\/customer-class', \{\n {4}responses: \{\n {6}'200': \{\n/,
            /content: \{\n {10}'application\/json': \{\n/,
            /async getCustomerClass\(\n {4}\@param\.path\.number\('id'\) id: typeof OrderClass\.prototype\.orderNumber,\n/,
            /\)\: Promise<CustomerClass> \{\n/,
            /return this\.orderClassRepository\.customerClass\(id\);\n {2}\}\n/,
          ];

          const getOrdersClassTypeByCustomerClassTypeIdRegEx = [
            /\@get\('\/order-class-types\/{id}\/customer-class-type', \{\n {4}responses: \{\n {6}'200': \{\n/,
            /content: \{\n {10}'application\/json': \{\n/,
            /async getCustomerClassType\(\n {4}\@param\.path\.string\('id'\) id: typeof OrderClassType\.prototype\.orderString,\n/,
            /\)\: Promise<CustomerClassType> \{\n/,
            /return this\.orderClassTypeRepository\.customerClassType\(id\);\n {2}\}\n/,
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
    }
  });

  context('check source class repository ', () => {
    const promptArray = [
      {
        relationType: 'belongsTo',
        sourceModel: 'Order',
        destinationModel: 'Customer',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClass',
        destinationModel: 'CustomerClass',
      },
      {
        relationType: 'belongsTo',
        sourceModel: 'OrderClassType',
        destinationModel: 'CustomerClassType',
      },
    ];

    const sourceClassnames = ['Order', 'OrderClass', 'OrderClassType'];

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

      it(sourceClassnames[i] + ' repostitory has all imports', async () => {
        const repositoryBasicImports = [
          /import \{DefaultCrudRepository, repository, BelongsToAccessor\} from \'@loopback\/repository\';\n/,
          /import \{inject, Getter\} from '\@loopback\/core';/,
        ];

        const repositoryClassImport = [
          /import \{CustomerRepository\} from '\.\/customer\.repository';/,
          /import \{Order, Customer\} from '\.\.\/models';/,
        ];
        const repositoryMultiWordClassImport = [
          /import \{CustomerClassRepository\} from '\.\/customer-class\.repository';/,
          /import \{OrderClass, CustomerClass\} from '\.\.\/models';/,
        ];

        const repositoryTypeClassImport = [
          /import \{CustomerClassTypeRepository\} from '\.\/customer-class-type\.repository';/,
          /import \{OrderClassType, CustomerClassType\} from '\.\.\/models';/,
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
          /public readonly customer: BelongsToAccessor<Customer, typeof Order\.prototype\.id>;\n/,
          /constructor\(@inject\('datasources\.db'\) dataSource: DbDataSource, @repository\.getter\('CustomerRepository'\) protected customerRepositoryGetter: Getter<CustomerRepository>,\) \{\n/,
          /super\(Order, dataSource\);\n {4}this\.customer = this\.createBelongsToAccessorFor\('customer', customerRepositoryGetter,\);\n {2}\}\n/,
        ];

        const multiWordClassConstractor = [
          /public readonly customerClass: BelongsToAccessor<CustomerClass, typeof OrderClass\.prototype\.orderNumber>;\n/,
          /constructor\(@inject\('datasources\.myDB'\) dataSource: MyDBDataSource, @repository\.getter\('CustomerClassRepository'\) protected customerClassRepositoryGetter: Getter<CustomerClassRepository>,\) \{\n/,
          /super\(OrderClass, dataSource\);\n {4}this\.customerClass = this\.createBelongsToAccessorFor\('customerClassCustNumber', customerClassRepositoryGetter,\);\n {2}\}\n/,
        ];

        const typeClassConstractor = [
          /public readonly customerClassType: BelongsToAccessor<CustomerClassType, typeof OrderClassType\.prototype\.orderString>;\n/,
          /constructor\(@inject\('datasources\.myDB'\) dataSource: MyDBDataSource, @repository\.getter\('CustomerClassTypeRepository'\) protected customerClassTypeRepositoryGetter: Getter<CustomerClassTypeRepository>,\) \{\n/,
          /super\(OrderClassType, dataSource\);\n {4}this\.customerClassType = this\.createBelongsToAccessorFor\('customerClassTypeCustNumber', customerClassTypeRepositoryGetter,\);\n {2}\}\n/,
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

    context('generate model relation for existing property name', () => {
      const expectedDecoretor = [
        /@belongsTo\(\(\) => Customer\)\n {2}myCustomer: number;\n/,
        /@belongsTo\(\(\) => CustomerClass\)\n {2}myCustomer: number;\n/,
        /@belongsTo\(\(\) => CustomerClassType\)\n {2}myCustomer: number;\n/,
      ];
      const promptList = [
        {
          relationType: 'belongsTo',
          sourceModel: 'Order',
          destinationModel: 'Customer',
          relationName: 'myCustomer',
        },
      ];

      it('Verify is property name that already exist will overwriting ', async () => {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(promptList[0]);

        const expectedSourceFile = path.join(
          SANDBOX_PATH,
          MODEL_APP_PATH,
          sourceFileName[0],
        );

        assert.file(expectedSourceFile);
        assert.fileContent(expectedSourceFile, expectedDecoretor[0]);

        const data = fs.readFileSync(expectedSourceFile);
        const indexOfFirstRelation = data.indexOf('@belongsTo');
        const lastIndexOfRelation = data.lastIndexOf('@belongsTo');
        assert.equal(indexOfFirstRelation, lastIndexOfRelation);
      });
    });
  });
});
