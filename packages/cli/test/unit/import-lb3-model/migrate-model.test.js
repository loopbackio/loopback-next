// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const loopback = require('loopback');
const {expect, sinon, toJSON} = require('@loopback/testlab');
const {
  importLb3ModelDefinition,
} = require('../../../generators/import-lb3-models/migrate-model');

describe('importLb3ModelDefinition', () => {
  let log;
  beforeEach(function setupLogSpy() {
    log = sinon.spy();
  });

  afterEach(function verifyNoExtraLogs() {
    sinon.assert.notCalled(log);
  });

  context('bare-bone model attached to memory', () => {
    let modelData;

    before(function setupLb3AppWithMemoryAndModel() {
      const MyModel = givenLb3Model('MyModel', {name: 'string'});
      modelData = importLb3ModelDefinition(MyModel, log);
    });

    it('normalizes model settings', () => {
      expect(toJSON(modelData.settings)).to.deepEqual({
        // By default, LB3 models are not strict
        strict: false,
      });
    });

    it('imports all properties', () => {
      expect(Object.keys(modelData.properties)).to.deepEqual(['id', 'name']);
    });

    it('normalizes custom property', () => {
      expect(modelData.properties).to.have.property('name').deepEqual({
        type: `'string'`,
        tsType: 'string',
      });
    });

    it('handles id property injected by the connector', () => {
      expect(modelData.properties).to.have.property('id').deepEqual({
        type: `'number'`,
        tsType: 'number',
        id: 1,
        generated: true,
        updateOnly: true,
      });
    });

    it('adds other data for the model template', () => {
      const options = getModelTemplateOptions(modelData);

      expect(options).to.deepEqual({
        name: 'MyModel',
        className: 'MyModel',

        modelBaseClass: 'Entity',
        isModelBaseBuiltin: true,

        allowAdditionalProperties: true,
      });
    });
  });

  context('model properties with db settings', () => {
    let modelData;

    const STRING_PROPERTY = {
      type: 'String',
      required: false,
      length: 25,
      precision: null,
      scale: null,
      postgresql: {
        columnName: 'name',
        dataType: 'character varying',
        dataLength: 25,
        dataPrecision: null,
        dataScale: null,
        nullable: 'YES',
      },
    };

    const NUMERIC_PROPERTY = {
      type: 'Number',
      required: false,
      length: null,
      precision: 64,
      scale: 0,
      postgresql: {
        columnName: 'count',
        dataType: 'bigint',
        dataLength: null,
        dataPrecision: 64,
        dataScale: 0,
        nullable: 'YES',
      },
    };

    before(function modelWithCustomDbSettings() {
      const properties = {
        name: STRING_PROPERTY,
        count: NUMERIC_PROPERTY,
      };
      const MyModel = givenLb3Model('MyModel', properties, {});
      modelData = importLb3ModelDefinition(MyModel, log);
    });

    it('connector metadata is migrated for string property', () => {
      expect(modelData.properties).to.have.property('name').deepEqual({
        type: `'string'`,
        tsType: 'string',
        length: 25,
        postgresql: `{columnName: 'name', dataType: 'character varying', dataLength: 25, dataPrecision: null, dataScale: null, nullable: 'YES'}`,
      });
    });

    it('connector metadata is migrated for numeric property', () => {
      expect(modelData.properties).to.have.property('count').deepEqual({
        type: `'number'`,
        tsType: 'number',
        precision: 64,
        scale: 0,
        postgresql: `{columnName: 'count', dataType: 'bigint', dataLength: null, dataPrecision: 64, dataScale: 0, nullable: 'YES'}`,
      });
    });
  });

  context('array properties', () => {
    it('correctly converts short-hand definition', () => {
      const MyModel = givenLb3Model('MyModel', {
        tags: ['string'],
      });
      const modelData = importLb3ModelDefinition(MyModel, log);

      expect(modelData.properties).to.have.property('tags').deepEqual({
        type: "'array'",
        itemType: "'string'",
        tsType: 'string[]',
      });
    });

    it('correctly converts long-style definition', () => {
      const MyModel = givenLb3Model('MyModel', {
        counts: {
          type: ['number'],
          required: true,
        },
      });
      const modelData = importLb3ModelDefinition(MyModel, log);

      expect(modelData.properties).to.have.property('counts').deepEqual({
        type: "'array'",
        itemType: "'number'",
        tsType: 'number[]',
        required: true,
      });
    });
  });

  context('base classes', () => {
    it('recognizes "Model" base', () => {
      const MyModel = givenLb3Model('MyModel', {}, {base: 'Model'});
      const modelData = importLb3ModelDefinition(MyModel, log);

      const options = getModelTemplateOptions(modelData);
      expect(options).to.containDeep({
        modelBaseClass: 'Model',
        isModelBaseBuiltin: true,
      });
    });

    it('recognizes "PersistedModel" base', () => {
      const MyModel = givenLb3Model('MyModel', {}, {base: 'PersistedModel'});
      const modelData = importLb3ModelDefinition(MyModel, log);

      const options = getModelTemplateOptions(modelData);
      expect(options).to.containDeep({
        modelBaseClass: 'Entity',
        isModelBaseBuiltin: true,
      });
    });

    it('recognizes "KeyValueModel" base', () => {
      const MyModel = givenLb3Model(
        'MyModel',
        {},
        {base: 'KeyValueModel'},
        {connector: 'kv-memory'},
      );
      const modelData = importLb3ModelDefinition(MyModel, log);

      const options = getModelTemplateOptions(modelData);
      expect(options).to.containDeep({
        modelBaseClass: 'KeyValueModel',
        isModelBaseBuiltin: true,
      });
    });

    it('supports LB3 built-in base classes not available in LB4', () => {
      const Customer = givenLb3Model('Customer', {}, {base: 'User'});
      const modelData = importLb3ModelDefinition(Customer, log);

      const options = getModelTemplateOptions(modelData);
      expect(options).to.containDeep({
        modelBaseClass: 'User',
        isModelBaseBuiltin: false,
      });

      log.resetHistory(); // ignore messages about ACLs & Relations
    });

    it('supports custom base classes', () => {
      const {model: Admin} = givenLb3BaseAndChildModels({
        model: {name: 'Admin'},
        base: {name: 'MyUserBase'},
      });
      const modelData = importLb3ModelDefinition(Admin, log);

      const options = getModelTemplateOptions(modelData);
      expect(options).to.containDeep({
        modelBaseClass: 'MyUserBase',
        isModelBaseBuiltin: false,
      });

      log.resetHistory(); // disable assertion in afterEach hook
    });
  });

  context('strict mode', () => {
    it('correctly handles "strict: true"', () => {
      const MyModel = givenLb3Model('MyModel', {}, {strict: true});

      const modelData = importLb3ModelDefinition(MyModel, log);

      const options = getModelTemplateOptions(modelData);
      expect(options).to.have.property('allowAdditionalProperties', false);
      expect(modelData.settings).to.have.property('strict', true);
    });

    it('correctly handles "strict: false"', () => {
      const MyModel = givenLb3Model('MyModel', {}, {strict: false});

      const modelData = importLb3ModelDefinition(MyModel, log);

      const options = getModelTemplateOptions(modelData);
      expect(options).to.have.property('allowAdditionalProperties', true);
      expect(modelData.settings).to.have.property('strict', false);
    });

    it('interprets "strict: undefined" as "strict: false"', () => {
      const MyModel = givenLb3Model('MyModel', {}, {strict: undefined});

      const modelData = importLb3ModelDefinition(MyModel, log);

      const options = getModelTemplateOptions(modelData);
      expect(options).to.have.property('allowAdditionalProperties', true);
      expect(modelData.settings).to.have.property('strict', false);
    });
  });

  context('forceId', () => {
    it('honors "forceId: true"', () => {
      const MyModel = givenLb3Model('MyModel', {}, {forceId: true});

      const modelData = importLb3ModelDefinition(MyModel, log);

      // "forceId: true" is converted by juggler to "auto" and then removed
      // during import, we want the runtime to decide based on PK definition
      expect(modelData.settings).to.not.have.property('forceId');

      expect(modelData.properties.id).to.containDeep({
        updateOnly: true,
      });
    });

    it('honors "forceId: false"', () => {
      const MyModel = givenLb3Model('MyModel', {}, {forceId: false});

      const modelData = importLb3ModelDefinition(MyModel, log);

      expect(modelData.settings).to.have.property('forceId', false);
      expect(modelData.properties.id).to.not.have.property('updateOnly');
    });
  });

  context('connector settings at model level', () => {
    it('is migrated as-is', () => {
      const MyModel = givenLb3Model(
        'MyModel',
        {},
        {
          strictObjectIDCoercion: true,
          mongodb: {
            collection: 'CustomCollectionName',
          },
        },
      );
      const modelData = importLb3ModelDefinition(MyModel, log);
      expect(modelData.settings).to.containDeep({
        strictObjectIDCoercion: true,
        mongodb: {
          collection: 'CustomCollectionName',
        },
      });
    });
  });

  context('inheritance', () => {
    let Customer, modelData;
    beforeEach(function defineCustomerInheritingFromUser() {
      Customer = givenLb3Model(
        'Customer',
        {
          isPreferred: {type: 'boolean', required: true},
        },
        {
          base: 'User',
          customCustomerSetting: true,
        },
      );
      modelData = importLb3ModelDefinition(Customer, log);
      log.resetHistory(); // ignore messages about ACLs & Relations
    });

    it('emits properties defined by the child model but not inherited', () => {
      expect(Object.keys(modelData.properties)).to.deepEqual(['isPreferred']);
      expect(modelData.properties).to.have.property('isPreferred').deepEqual({
        type: `'boolean'`,
        tsType: 'boolean',
        required: true,
      });
    });

    it('emits model-level settings defined by the model but not inherited', () => {
      expect(toJSON(modelData.settings)).to.deepEqual({
        // By default, LB3 models are not strict
        strict: false,
        customCustomerSetting: true,
      });
    });
  });

  context('relations', () => {
    it('reports a warning', () => {
      const app = givenLb3App();
      app.dataSource('ds', {connector: 'memory'});

      const Product = app.registry.createModel('Product');
      app.model(Product, {dataSource: 'ds'});

      const Category = Product.app.registry.createModel(
        'Category',
        {},
        {
          relations: {
            products: {
              type: 'hasMany',
              model: 'Product',
            },
          },
        },
      );
      app.model(Category, {dataSource: 'ds'});

      importLb3ModelDefinition(Category, log);

      sinon.assert.calledOnce(log);
      sinon.assert.calledWithMatch(
        log,
        /Import of model relations is not supported yet. Skipping the following relations: products/,
      );
      log.resetHistory(); // disable assertion in afterEach hook
    });
  });

  context('acls', () => {
    it('reports a warning', () => {
      const DUMMY_ACL = {
        principalType: 'ROLE',
        principalId: '$everyone',
        permission: 'DENY',
      };
      const MyModel = givenLb3Model('MyModel', {}, {acls: [DUMMY_ACL]});

      importLb3ModelDefinition(MyModel, log);

      sinon.assert.calledOnce(log);
      sinon.assert.calledWithMatch(
        log,
        /Ignoring the following unsupported settings: acls/,
      );
      log.resetHistory(); // disable assertion in afterEach hook
    });
  });

  context('methods', () => {
    it('reports a warning', () => {
      const DUMMY_METHODS = {
        find: {
          accepts: [],
          returns: [],
        },
      };

      const MyModel = givenLb3Model('MyModel', {}, {methods: DUMMY_METHODS});

      importLb3ModelDefinition(MyModel, log);

      sinon.assert.calledOnce(log);
      sinon.assert.calledWithMatch(
        log,
        /Ignoring the following unsupported settings: methods/,
      );
      log.resetHistory(); // disable assertion in afterEach hook
    });
  });

  context('mixins', () => {
    it('reports a warning', () => {
      const app = givenLb3App();
      app.dataSource('ds', {connector: 'memory'});

      // Register a dummy mixin
      app.registry.modelBuilder.mixins.define('timestamp', function (ctor) {});

      // Create a model using that mixin
      const DUMMY_MIXINS = {
        timestamp: true,
      };
      const MyModel = app.registry.createModel(
        'MyModel',
        {},
        {mixins: DUMMY_MIXINS},
      );
      app.model(MyModel, {dataSource: 'ds'});

      importLb3ModelDefinition(MyModel, log);

      sinon.assert.calledOnce(log);
      sinon.assert.calledWithMatch(
        log,
        /Ignoring the following unsupported settings: mixins/,
      );
      log.resetHistory(); // disable assertion in afterEach hook
    });
  });
});

function givenLb3App() {
  return loopback({localRegistry: true, loadBuiltinModels: true});
}

function givenLb3Model(
  name,
  properties = {},
  settings = {},
  dataSourceConfig = {connector: 'memory'},
) {
  const app = givenLb3App();
  app.dataSource('ds', dataSourceConfig);
  const ModelCtor = app.registry.createModel(name, properties, settings);
  app.model(ModelCtor, {dataSource: 'ds'});
  return ModelCtor;
}

function givenLb3BaseAndChildModels({
  model,
  base,
  dataSourceConfig = {connector: 'memory'},
}) {
  const app = givenLb3App();
  app.dataSource('ds', dataSourceConfig);
  const BaseCtor = app.registry.createModel(
    base.name,
    base.properties,
    base.settings,
  );
  const ModelCtor = app.registry.createModel(model.name, model.properties, {
    base: base.name,
    ...model.settings,
  });
  app.model(ModelCtor, {dataSource: 'ds'});
  return {model: ModelCtor, base: BaseCtor};
}

function getModelTemplateOptions(templateData) {
  const options = {...templateData};

  // Settings & properties have been already tested (see above)
  delete options.settings;
  delete options.properties;
  // We don't care about stringified settings as they are auto-generated
  delete options.modelSettings;

  return options;
}
