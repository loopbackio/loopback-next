// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3-types
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  createEmptyApiSpec,
  DiscriminatorObject,
  ExampleObject,
  ExternalDocumentationObject,
  ISpecificationExtension,
  OpenAPIObject,
  ReferenceObject,
  XmlObject,
} from '../..';

describe('openapi-v3-types unit tests', () => {
  describe('createEmptyApiSpec', () => {
    let emptySpec: OpenAPIObject;

    beforeEach(createEmptySpec);

    it('sets version 3 for an empty spec', () => {
      expect(emptySpec.openapi).to.equal('3.0.0');
    });

    it('sets the spec info object', () => {
      expect(emptySpec.info).to.be.an.Object();
      expect(emptySpec.info.title).to.equal('LoopBack Application');
      expect(emptySpec.info.version).to.equal('1.0.0');
    });

    it('creates an empty paths object', () => {
      expect(emptySpec.paths).to.be.an.Object();
      expect(emptySpec.paths).to.be.empty();
    });

    it('creates a default servers array', () => {
      expect(emptySpec.servers).to.be.an.Array();
      expect(emptySpec.servers).to.have.lengthOf(1);
      const server = emptySpec.servers ? emptySpec.servers[0] : undefined;
      expect(server).to.not.be.Undefined();
      const serverUrl = server ? server.url : '';
      expect(serverUrl).to.equal('/');
    });

    function createEmptySpec() {
      emptySpec = createEmptyApiSpec();
    }
  });

  describe('interfaces', () => {
    /**
     * The classes below are declared as tests for the Interfaces. The TS Compiler
     * will complain if an interface changes with a way inconsistent with the
     * original OAS 3 definition. (Though some interfaces allow for extensibility).
     */

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class TestObject implements ExampleObject {
      summary: 'test object';
      description: 'test object';
      value: 1;
      externalValue: '1';
      randomProperty: 'extension value';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class ReferenceTestObject implements ReferenceObject {
      $ref: '#def/reference-object';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class DiscriminatorTestObject implements DiscriminatorObject {
      propertyName: 'test';
      mapping: {
        hello: 'world';
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class XMLTestObject implements XmlObject {
      name: 'test';
      namespace: 'test';
      prefix: 'test';
      attribute: false;
      wrapped: false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class TestExternalDocumentationObject
      implements ExternalDocumentationObject {
      url: 'https://test.com/test.html';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class TestISpecificationExtension implements ISpecificationExtension {
      test: 'test';
    }
  });
});
