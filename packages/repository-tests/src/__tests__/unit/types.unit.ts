// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  DataSourceOptions,
  TransactionalRepositoryCtor,
} from '../../types.repository-tests';

describe('types.repository-tests', () => {
  describe('CrudFeatures', () => {
    it('defines idType as string or number', () => {
      const features: CrudFeatures = {
        idType: 'string',
        freeFormProperties: true,
        emptyValue: undefined,
        supportsTransactions: false,
        supportsInclusionResolvers: true,
        hasRevisionToken: false,
      };

      expect(features.idType).to.be.oneOf(['string', 'number']);
    });

    it('supports number idType', () => {
      const features: CrudFeatures = {
        idType: 'number',
        freeFormProperties: false,
        emptyValue: null,
        supportsTransactions: true,
        supportsInclusionResolvers: true,
        hasRevisionToken: false,
      };

      expect(features.idType).to.equal('number');
    });

    it('defines freeFormProperties flag', () => {
      const features: CrudFeatures = {
        idType: 'string',
        freeFormProperties: false,
        emptyValue: undefined,
        supportsTransactions: false,
        supportsInclusionResolvers: true,
        hasRevisionToken: false,
      };

      expect(features.freeFormProperties).to.be.false();
    });

    it('defines emptyValue as undefined or null', () => {
      const featuresWithUndefined: CrudFeatures = {
        idType: 'string',
        freeFormProperties: true,
        emptyValue: undefined,
        supportsTransactions: false,
        supportsInclusionResolvers: true,
        hasRevisionToken: false,
      };

      const featuresWithNull: CrudFeatures = {
        idType: 'string',
        freeFormProperties: true,
        emptyValue: null,
        supportsTransactions: false,
        supportsInclusionResolvers: true,
        hasRevisionToken: false,
      };

      expect(featuresWithUndefined.emptyValue).to.be.undefined();
      expect(featuresWithNull.emptyValue).to.be.null();
    });

    it('defines supportsTransactions flag', () => {
      const features: CrudFeatures = {
        idType: 'string',
        freeFormProperties: true,
        emptyValue: undefined,
        supportsTransactions: true,
        supportsInclusionResolvers: true,
        hasRevisionToken: false,
      };

      expect(features.supportsTransactions).to.be.true();
    });

    it('defines supportsInclusionResolvers flag', () => {
      const features: CrudFeatures = {
        idType: 'string',
        freeFormProperties: true,
        emptyValue: undefined,
        supportsTransactions: false,
        supportsInclusionResolvers: false,
        hasRevisionToken: false,
      };

      expect(features.supportsInclusionResolvers).to.be.false();
    });

    it('defines hasRevisionToken flag', () => {
      const features: CrudFeatures = {
        idType: 'string',
        freeFormProperties: true,
        emptyValue: undefined,
        supportsTransactions: false,
        supportsInclusionResolvers: true,
        hasRevisionToken: true,
      };

      expect(features.hasRevisionToken).to.be.true();
    });
  });

  describe('DataSourceOptions', () => {
    it('accepts connector configuration', () => {
      const options: DataSourceOptions = {
        connector: 'memory',
      };

      expect(options.connector).to.equal('memory');
    });

    it('accepts connection string', () => {
      const options: DataSourceOptions = {
        connector: 'mongodb',
        url: 'mongodb://localhost:27017/testdb',
      };

      expect(options.url).to.equal('mongodb://localhost:27017/testdb');
    });

    it('accepts additional properties', () => {
      const options: DataSourceOptions = {
        connector: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
      };

      expect(options.host).to.equal('localhost');
      expect(options.port).to.equal(5432);
    });
  });

  describe('CrudRepositoryCtor', () => {
    it('defines constructor signature for CRUD repositories', () => {
      // The type should accept a constructor that creates repositories
      const isValidType = (ctor: CrudRepositoryCtor) => {
        expect(ctor).to.be.a.Function();
      };

      // We can't easily test the actual constructor without a concrete implementation,
      // but we can verify the type definition is valid
      expect(isValidType).to.be.a.Function();
    });
  });

  describe('TransactionalRepositoryCtor', () => {
    it('defines constructor signature for transactional repositories', () => {
      // The type should accept a constructor that creates transactional repositories
      const isValidType = (ctor: TransactionalRepositoryCtor) => {
        expect(ctor).to.be.a.Function();
      };

      // We can't easily test the actual constructor without a concrete implementation,
      // but we can verify the type definition is valid
      expect(isValidType).to.be.a.Function();
    });
  });

  describe('Feature combinations', () => {
    it('supports SQL database features', () => {
      const sqlFeatures: CrudFeatures = {
        idType: 'number',
        freeFormProperties: false,
        emptyValue: null,
        supportsTransactions: true,
        supportsInclusionResolvers: true,
        hasRevisionToken: false,
      };

      expect(sqlFeatures.idType).to.equal('number');
      expect(sqlFeatures.freeFormProperties).to.be.false();
      expect(sqlFeatures.supportsTransactions).to.be.true();
    });

    it('supports NoSQL database features', () => {
      const nosqlFeatures: CrudFeatures = {
        idType: 'string',
        freeFormProperties: true,
        emptyValue: undefined,
        supportsTransactions: false,
        supportsInclusionResolvers: true,
        hasRevisionToken: false,
      };

      expect(nosqlFeatures.idType).to.equal('string');
      expect(nosqlFeatures.freeFormProperties).to.be.true();
      expect(nosqlFeatures.supportsTransactions).to.be.false();
    });

    it('supports Cloudant-specific features', () => {
      const cloudantFeatures: CrudFeatures = {
        idType: 'string',
        freeFormProperties: true,
        emptyValue: undefined,
        supportsTransactions: false,
        supportsInclusionResolvers: true,
        hasRevisionToken: true,
      };

      expect(cloudantFeatures.hasRevisionToken).to.be.true();
    });
  });
});

// Made with Bob
