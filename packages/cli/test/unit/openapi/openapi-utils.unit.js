// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const expect = require('@loopback/testlab').expect;
const utils = require('../../../generators/openapi/utils');
const json5 = require('json5');

describe('openapi utils', () => {
  it('escapes keywords for an identifier', () => {
    expect(utils.escapeIdentifier('for')).to.eql('_for');
  });

  it('escapes an identifier conflicting with decorators for ', () => {
    expect(utils.escapeIdentifier('requestBody')).to.eql('_requestBody');
    expect(utils.escapeIdentifier('operation')).to.eql('_operation');
    expect(utils.escapeIdentifier('param')).to.eql('_param');
  });

  it('escapes illegal chars for an identifier', () => {
    expect(utils.escapeIdentifier('foo bar')).to.eql('fooBar');
    expect(utils.escapeIdentifier('foo-bar')).to.eql('fooBar');
    expect(utils.escapeIdentifier('foo.bar')).to.eql('fooBar');
  });

  it('does not escape legal chars for an identifier', () => {
    expect(utils.escapeIdentifier('foobar')).to.eql('foobar');
    expect(utils.escapeIdentifier('fooBar')).to.eql('fooBar');
    expect(utils.escapeIdentifier('Foobar')).to.eql('Foobar');
  });

  it('escapes property names with illegal chars', () => {
    expect(utils.escapePropertyName('customer-id')).to.eql("'customer-id'");
    expect(utils.escapePropertyName('customer id')).to.eql("'customer id'");
    expect(utils.escapePropertyName('customer.id')).to.eql("'customer.id'");
    expect(utils.escapePropertyName('default')).to.eql("'default'");
  });

  it('does not escape property names with legal chars', () => {
    expect(utils.escapePropertyName('customerId')).to.eql('customerId');
    expect(utils.escapePropertyName('customer_id')).to.eql('customer_id');
    expect(utils.escapePropertyName('customerid')).to.eql('customerid');
  });

  it('escapes chars for comments', () => {
    expect(utils.escapeComment('/* abc */')).to.eql('\\/* abc *\\/');
    expect(utils.escapeComment('/* abc')).to.eql('\\/* abc');
    expect(utils.escapeComment('abc */')).to.eql('abc *\\/');
    expect(utils.escapeComment('abc')).to.eql('abc');
  });

  it('keeps x-$ref and x-$original-value in a cloned spec object', () => {
    const {copy} = givenAClonedSpec();
    const schema =
      copy.paths['/create'].post.requestBody.content['application/json'].schema;
    expect(schema['x-$ref']).to.eql(schema.$ref);
    expect(schema['x-$original-value']).to.eql(
      "{\n  $ref: '#/components/schemas/Customer',\n}",
    );
    const location =
      copy.paths['/create'].post.responses['200'].headers.Location;
    expect(location['x-$ref']).to.eql(location.$ref);
    expect(location['x-$original-value']).to.eql(
      "{\n  $ref: '#/components/headers/Location',\n}",
    );
  });

  it('prints spec object', () => {
    const {spec, copy} = givenAClonedSpec();
    const str = utils.printSpecObject(copy);
    expect(json5.parse(str)).to.eql(spec);
  });

  it('converts to json schema with array', () => {
    const {spec} = givenAClonedSpec();
    const jsonSchema = utils.toJsonSchema(spec.components.schemas.Customer);
    expect(jsonSchema).to.eql({
      description: 'Customer',
      type: 'object',
      properties: {
        id: {type: 'string'},
        name: {type: 'string'},
        emails: {type: 'array', items: {$ref: '#/components/schemas/Email'}},
      },
      $id: 'customer-schema',
    });
  });

  it('transforms true exclusiveMaximum and exclusiveMinimum', () => {
    const openapiSchema = {
      id: 'customer-schema',
      $schema: 'http://json-schema.org/draft-04/schema#',
      description: 'Customer',
      type: 'object',
      properties: {
        name: {type: 'string'},
        budget: {
          type: 'number',
          maximum: 100,
          minimum: 1,
          exclusiveMaximum: true,
          exclusiveMinimum: true,
        },
      },
      additionalProperties: {
        type: 'string',
      },
    };
    const jsonSchema = utils.toJsonSchema(openapiSchema);
    expect(jsonSchema).to.eql({
      $id: 'customer-schema',
      description: 'Customer',
      type: 'object',
      properties: {
        name: {type: 'string'},
        budget: {
          type: 'number',
          exclusiveMaximum: 100,
          exclusiveMinimum: 1,
        },
      },
      additionalProperties: {
        type: 'string',
      },
    });
  });

  it('transforms false exclusiveMaximum and exclusiveMinimum', () => {
    const openapiSchema = {
      id: 'customer-schema',
      $schema: 'http://json-schema.org/draft-04/schema#',
      description: 'Customer',
      type: 'object',
      properties: {
        name: {type: 'string'},
        budget: {
          type: 'number',
          maximum: 100,
          minimum: 1,
          exclusiveMaximum: false,
          exclusiveMinimum: false,
        },
      },
      additionalProperties: {
        type: 'string',
      },
    };
    const jsonSchema = utils.toJsonSchema(openapiSchema);
    expect(jsonSchema).to.eql({
      $id: 'customer-schema',
      description: 'Customer',
      type: 'object',
      properties: {
        name: {type: 'string'},
        budget: {
          type: 'number',
          maximum: 100,
          minimum: 1,
        },
      },
      additionalProperties: {
        type: 'string',
      },
    });
  });

  function givenAClonedSpec() {
    const spec = {
      openapi: '3.0.0',
      paths: {
        '/create': {
          post: {
            tags: ['Customer'],
            operationId: 'create',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Customer',
                  },
                },
              },
            },
            responses: {
              200: {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Customer',
                    },
                  },
                },
                headers: {
                  Location: {
                    $ref: '#/components/headers/Location',
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Customer: {
            id: 'customer-schema',
            $schema: 'http://json-schema.org/draft-04/schema#',
            description: 'Customer',
            type: 'object',
            properties: {
              id: {type: 'string'},
              name: {type: 'string'},
              emails: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Email',
                },
              },
            },
          },
          Email: {
            description: 'Email',
            type: 'object',
            properties: {
              label: {type: 'string'},
              address: {type: 'string'},
            },
          },
        },
        headers: {
          Location: {
            name: 'Location',
            in: 'header',
            description: 'Location response header',
            required: false,
            schema: {
              type: 'string',
            },
          },
        },
      },
    };
    const copy = utils.cloneSpecObject(spec);
    return {spec, copy};
  }
});
