// Copyright IBM Corp. and LoopBack contributors 2019,2026. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {expect} = require('@loopback/testlab');
const path = require('path');
const {
  sanitizeProperty,
  DEFAULT_DATASOURCE_DIRECTORY,
  MODEL_TEMPLATE_PATH,
} = require('../../lib/model-discoverer');

describe('model-discoverer unit tests', () => {
  describe('sanitizeProperty', () => {
    it('removes null properties', () => {
      const obj = {
        name: 'test',
        value: null,
        description: 'A test object',
      };
      sanitizeProperty(obj);
      expect(obj).to.not.have.property('value');
      expect(obj).to.have.property('name', 'test');
      expect(obj).to.have.property('description', 'A test object');
    });

    it('stringifies object properties', () => {
      const obj = {
        name: 'test',
        metadata: {key: 'value', nested: {prop: 'data'}},
      };
      sanitizeProperty(obj);
      expect(obj.metadata).to.be.a.String();
      expect(obj.metadata).to.match(/key.*value/);
    });

    it('stringifies array properties', () => {
      const obj = {
        name: 'test',
        items: ['item1', 'item2', 'item3'],
      };
      sanitizeProperty(obj);
      expect(obj.items).to.be.a.String();
      expect(obj.items).to.match(/item1/);
      expect(obj.items).to.match(/item2/);
    });

    it('adds tsType property from type', () => {
      const obj = {
        name: 'test',
        type: 'string',
      };
      sanitizeProperty(obj);
      expect(obj).to.have.property('tsType', 'string');
    });

    it('handles empty objects', () => {
      const obj = {};
      sanitizeProperty(obj);
      expect(obj).to.have.property('tsType', undefined);
    });

    it('handles objects with only null values', () => {
      const obj = {
        prop1: null,
        prop2: null,
      };
      sanitizeProperty(obj);
      expect(obj).to.not.have.property('prop1');
      expect(obj).to.not.have.property('prop2');
    });

    it('preserves string properties', () => {
      const obj = {
        name: 'test',
        description: 'A description',
        type: 'number',
      };
      sanitizeProperty(obj);
      expect(obj.name).to.equal('test');
      expect(obj.description).to.equal('A description');
      expect(obj.type).to.equal('number');
    });

    it('preserves number properties', () => {
      const obj = {
        id: 123,
        count: 456,
        type: 'integer',
      };
      sanitizeProperty(obj);
      expect(obj.id).to.equal(123);
      expect(obj.count).to.equal(456);
    });

    it('preserves boolean properties', () => {
      const obj = {
        required: true,
        nullable: false,
        type: 'boolean',
      };
      sanitizeProperty(obj);
      expect(obj.required).to.equal(true);
      expect(obj.nullable).to.equal(false);
    });

    it('handles nested objects correctly', () => {
      const obj = {
        name: 'test',
        config: {
          option1: 'value1',
          option2: null,
          nested: {
            deep: 'property',
          },
        },
        type: 'object',
      };
      sanitizeProperty(obj);
      expect(obj.config).to.be.a.String();
      expect(obj.config).to.match(/option1/);
      expect(obj.config).to.not.match(/option2/);
    });
  });

  describe('constants', () => {
    it('exports DEFAULT_DATASOURCE_DIRECTORY', () => {
      expect(DEFAULT_DATASOURCE_DIRECTORY).to.equal('./dist/datasources');
    });

    it('exports MODEL_TEMPLATE_PATH', () => {
      expect(MODEL_TEMPLATE_PATH).to.be.a.String();
      expect(MODEL_TEMPLATE_PATH).to.match(/model\.ts\.ejs$/);
    });

    it('MODEL_TEMPLATE_PATH points to existing template location', () => {
      const expectedPath = path.resolve(
        __dirname,
        '../../generators/model/templates/model.ts.ejs',
      );
      expect(MODEL_TEMPLATE_PATH).to.equal(expectedPath);
    });
  });
});

// Made with Bob
