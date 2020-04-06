// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {expect} = require('@loopback/testlab');
const {
  importDiscoveredModel,
} = require('../../../generators/discover/import-discovered-model');

describe('importDiscoveredModel', () => {
  it('imports empty schema', () => {
    const modelData = importDiscoveredModel({
      name: 'Schema',
      schema: 'aSchema',
      properties: {},
    });
    expect(modelData).to.deepEqual({
      name: 'Schema',
      className: 'Schema',
      modelBaseClass: 'Entity',
      isModelBaseBuiltin: true,

      settings: {},
      modelSettings: '',

      properties: {},
      allowAdditionalProperties: true,
    });
  });

  it('imports Date properties', () => {
    const discoveredModel = {
      name: 'TestModel',
      properties: {
        createdAt: {
          type: 'Date',
          required: false,
          length: null,
          precision: null,
          scale: null,
        },
      },
    };
    const modelData = importDiscoveredModel(discoveredModel);
    expect(modelData.properties).to.have.property('createdAt').deepEqual({
      type: `'date'`,
      tsType: 'string',
    });
  });

  it('imports Number properties', () => {
    const discoveredModel = {
      name: 'TestModel',
      properties: {
        counter: {
          type: 'Number',
          required: false,
          length: null,
          precision: null,
          scale: null,
        },
      },
    };
    const modelData = importDiscoveredModel(discoveredModel);
    expect(modelData.properties).to.have.property('counter').deepEqual({
      type: `'number'`,
      tsType: 'number',
    });
  });

  it('imports String properties', () => {
    const discoveredModel = {
      name: 'TestModel',
      properties: {
        title: {
          type: 'String',
          length: null,
          precision: null,
          scale: null,
        },
      },
    };

    const modelData = importDiscoveredModel(discoveredModel);
    expect(modelData.properties).to.have.property('title').deepEqual({
      type: `'string'`,
      tsType: 'string',
    });
  });

  it('imports Boolean properties', () => {
    const discoveredModel = {
      name: 'TestModel',
      properties: {
        active: {
          type: 'Boolean',
          required: false,
          length: null,
          precision: null,
          scale: null,
        },
      },
    };

    const modelData = importDiscoveredModel(discoveredModel);
    expect(modelData.properties).to.have.property('active').deepEqual({
      type: `'boolean'`,
      tsType: 'boolean',
    });
  });

  it('imports numeric primary key', () => {
    const discoveredModel = {
      name: 'TestModel',
      properties: {
        id: {
          type: 'Number',
          required: false,
          length: null,
          precision: null,
          scale: 0,
          id: 1,
        },
      },
    };

    const modelData = importDiscoveredModel(discoveredModel);
    expect(modelData.properties).to.have.property('id').deepEqual({
      type: `'number'`,
      tsType: 'number',
      scale: 0,
      id: 1,
    });
  });

  it('converts connector metadata to TypeScript object', () => {
    const discoveredModel = {
      name: 'TestModel',
      properties: {
        title: {
          type: 'String',
          required: false,
          postgresql: {
            columnName: 'title',
            dataType: 'text',
            dataLength: null,
            dataPrecision: null,
            dataScale: null,
            nullable: 'NO',
          },
        },
      },
    };

    const modelData = importDiscoveredModel(discoveredModel);
    expect(modelData.properties).to.have.property('title').deepEqual({
      type: `'string'`,
      tsType: 'string',
      postgresql: `{columnName: 'title', dataType: 'text', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO'}`,
    });
  });
});
