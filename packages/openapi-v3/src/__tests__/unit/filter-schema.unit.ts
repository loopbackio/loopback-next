// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {getFilterSchemaFor} from '../..';

describe('filterSchema', () => {
  @model({
    name: 'my-user-model',
  })
  class MyUserModel extends Entity {
    @property() id: string;

    @property() age: number;
  }

  it('generate filter schema', () => {
    const schema = getFilterSchemaFor(MyUserModel);
    expect(MyUserModel.definition.name).to.eql('my-user-model');
    expect(schema).to.eql({
      title: 'my-user-model.Filter',
      type: 'object',
      'x-typescript-type': '@loopback/repository#Filter<MyUserModel>',
      properties: {
        where: {
          type: 'object',
          title: 'my-user-model.WhereFilter',
          additionalProperties: true,
        },
        fields: {
          oneOf: [
            {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: {
                  type: 'boolean',
                },
                age: {
                  type: 'boolean',
                },
              },
            },
            {
              type: 'array',
              uniqueItems: true,
              items: {
                enum: ['id', 'age'],
                type: 'string',
                example: 'id',
              },
            },
          ],
          title: 'my-user-model.Fields',
        },
        offset: {type: 'integer', minimum: 0},
        limit: {type: 'integer', minimum: 1, example: 100},
        skip: {type: 'integer', minimum: 0},
        order: {
          oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}],
        },
      },
      additionalProperties: false,
    });
  });

  it('generate filter schema excluding where', () => {
    const schema = getFilterSchemaFor(MyUserModel, {exclude: ['where']});
    expect(MyUserModel.definition.name).to.eql('my-user-model');
    expect(schema).to.eql({
      title: 'my-user-model.Filter',
      type: 'object',
      'x-typescript-type': '@loopback/repository#Filter<MyUserModel>',
      properties: {
        fields: {
          oneOf: [
            {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: {
                  type: 'boolean',
                },
                age: {
                  type: 'boolean',
                },
              },
            },
            {
              type: 'array',
              uniqueItems: true,
              items: {
                enum: ['id', 'age'],
                type: 'string',
                example: 'id',
              },
            },
          ],
          title: 'my-user-model.Fields',
        },
        offset: {type: 'integer', minimum: 0},
        limit: {type: 'integer', minimum: 1, example: 100},
        skip: {type: 'integer', minimum: 0},
        order: {
          oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}],
        },
      },
      additionalProperties: false,
    });
  });

  @model({
    name: 'CustomUserModel',
  })
  class CustomUserModel extends Entity {
    @property() id: string;

    @property() age: number;
  }

  it('generates filter schema with custom name', () => {
    const schema = getFilterSchemaFor(CustomUserModel);
    expect(CustomUserModel.definition.name).to.eql('CustomUserModel');
    expect(schema).to.eql({
      title: 'CustomUserModel.Filter',
      type: 'object',
      'x-typescript-type': '@loopback/repository#Filter<CustomUserModel>',
      properties: {
        where: {
          type: 'object',
          title: 'CustomUserModel.WhereFilter',
          additionalProperties: true,
        },
        fields: {
          oneOf: [
            {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: {
                  type: 'boolean',
                },
                age: {
                  type: 'boolean',
                },
              },
            },
            {
              type: 'array',
              uniqueItems: true,
              items: {
                enum: ['id', 'age'],
                type: 'string',
                example: 'id',
              },
            },
          ],
          title: 'CustomUserModel.Fields',
        },
        offset: {type: 'integer', minimum: 0},
        limit: {type: 'integer', minimum: 1, example: 100},
        skip: {type: 'integer', minimum: 0},
        order: {
          oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}],
        },
      },
      additionalProperties: false,
    });
  });
});
