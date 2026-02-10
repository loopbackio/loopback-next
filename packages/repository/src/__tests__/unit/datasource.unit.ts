// Copyright IBM Corp. and LoopBack contributors 2017,2026. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {DataSource, SchemaMigrationOptions} from '../../datasource';

describe('DataSource', () => {
  describe('interface', () => {
    it('defines required name property', () => {
      const ds: DataSource = {
        name: 'testDB',
        settings: {},
      };
      expect(ds.name).to.equal('testDB');
    });

    it('defines optional connector property', () => {
      const ds: DataSource = {
        name: 'testDB',
        settings: {},
        connector: {
          name: 'memory',
          connect: async () => {},
          disconnect: async () => {},
          ping: async () => {},
        },
      };
      expect(ds.connector).to.be.ok();
      expect(ds.connector!.name).to.equal('memory');
    });

    it('defines settings property', () => {
      const settings = {host: 'localhost', port: 3306};
      const ds: DataSource = {
        name: 'testDB',
        settings,
      };
      expect(ds.settings).to.deepEqual(settings);
    });

    it('allows arbitrary properties', () => {
      const ds: DataSource = {
        name: 'testDB',
        settings: {},
        customProp: 'customValue',
        anotherProp: 123,
      };
      expect(ds.customProp).to.equal('customValue');
      expect(ds.anotherProp).to.equal(123);
    });

    it('supports empty settings', () => {
      const ds: DataSource = {
        name: 'testDB',
        settings: {},
      };
      expect(ds.settings).to.deepEqual({});
    });

    it('supports complex settings', () => {
      const ds: DataSource = {
        name: 'testDB',
        settings: {
          host: 'localhost',
          port: 3306,
          database: 'mydb',
          user: 'admin',
          password: 'secret',
          options: {
            ssl: true,
            timeout: 5000,
          },
        },
      };
      expect(ds.settings.host).to.equal('localhost');
      expect(ds.settings.options.ssl).to.be.true();
    });
  });

  describe('SchemaMigrationOptions', () => {
    it('supports existingSchema drop option', () => {
      const options: SchemaMigrationOptions = {
        existingSchema: 'drop',
      };
      expect(options.existingSchema).to.equal('drop');
    });

    it('supports existingSchema alter option', () => {
      const options: SchemaMigrationOptions = {
        existingSchema: 'alter',
      };
      expect(options.existingSchema).to.equal('alter');
    });

    it('supports models array option', () => {
      const options: SchemaMigrationOptions = {
        models: ['User', 'Product', 'Order'],
      };
      expect(options.models).to.deepEqual(['User', 'Product', 'Order']);
    });

    it('supports empty models array', () => {
      const options: SchemaMigrationOptions = {
        models: [],
      };
      expect(options.models).to.deepEqual([]);
    });

    it('supports combined options', () => {
      const options: SchemaMigrationOptions = {
        existingSchema: 'alter',
        models: ['User', 'Product'],
      };
      expect(options.existingSchema).to.equal('alter');
      expect(options.models).to.have.length(2);
    });

    it('allows no options', () => {
      const options: SchemaMigrationOptions = {};
      expect(options.existingSchema).to.be.undefined();
      expect(options.models).to.be.undefined();
    });

    it('extends Options interface', () => {
      const options: SchemaMigrationOptions = {
        existingSchema: 'drop',
        models: ['User'],
        // Can include other options
        timeout: 5000,
      };
      expect(options.timeout).to.equal(5000);
    });
  });
});

// Made with Bob
