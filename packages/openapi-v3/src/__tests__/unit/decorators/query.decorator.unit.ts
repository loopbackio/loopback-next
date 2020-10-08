// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Count,
  Filter,
  FilterExcludingWhere,
  model,
  Model,
  property,
  Where,
} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {ControllerSpec, get, getControllerSpec, param} from '../../..';

describe('sugar decorators for filter and where', () => {
  let controllerSpec: ControllerSpec;

  before(() => {
    controllerSpec = getControllerSpec(MyController);
  });

  it('allows @param.filter', () => {
    expect(controllerSpec.paths['/'].get.parameters).to.eql([
      {
        name: 'filter',
        in: 'query',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              title: 'MyModel.Filter',
              'x-typescript-type': '@loopback/repository#Filter<MyModel>',
              properties: {
                fields: {
                  oneOf: [
                    {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        name: {
                          type: 'boolean',
                        },
                      },
                    },
                    {
                      type: 'array',
                      uniqueItems: true,
                      items: {
                        enum: ['name'],
                        type: 'string',
                        example: 'name',
                      },
                    },
                  ],
                  title: 'MyModel.Fields',
                },
                offset: {type: 'integer', minimum: 0},
                limit: {type: 'integer', minimum: 1, example: 100},
                skip: {type: 'integer', minimum: 0},
                order: {
                  oneOf: [
                    {type: 'string'},
                    {type: 'array', items: {type: 'string'}},
                  ],
                },
                where: {
                  title: 'MyModel.WhereFilter',
                  type: 'object',
                  additionalProperties: true,
                },
              },
              additionalProperties: false,
            },
          },
        },
      },
    ]);
  });

  it('allows @param.filter with a custom name', () => {
    expect(controllerSpec.paths['/find'].get.parameters).to.eql([
      {
        name: 'query',
        in: 'query',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              title: 'MyModel.Filter',
              'x-typescript-type': '@loopback/repository#Filter<MyModel>',
              properties: {
                fields: {
                  oneOf: [
                    {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        name: {
                          type: 'boolean',
                        },
                      },
                    },
                    {
                      type: 'array',
                      uniqueItems: true,
                      items: {
                        enum: ['name'],
                        type: 'string',
                        example: 'name',
                      },
                    },
                  ],
                  title: 'MyModel.Fields',
                },
                offset: {type: 'integer', minimum: 0},
                limit: {type: 'integer', minimum: 1, example: 100},
                skip: {type: 'integer', minimum: 0},
                order: {
                  oneOf: [
                    {type: 'string'},
                    {type: 'array', items: {type: 'string'}},
                  ],
                },
                where: {
                  title: 'MyModel.WhereFilter',
                  type: 'object',
                  additionalProperties: true,
                },
              },
              additionalProperties: false,
            },
          },
        },
      },
    ]);
  });

  it('allows @param.filter with a custom name via options', () => {
    expect(controllerSpec.paths['/find'].get.parameters[0].name).to.eql(
      'query',
    );
  });

  it('allows @param.filter() excluding where', () => {
    expect(controllerSpec.paths['/{id}'].get.parameters).to.eql([
      {name: 'id', in: 'path', schema: {type: 'string'}, required: true},
      {
        name: 'filter',
        in: 'query',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              title: 'MyModel.Filter',
              'x-typescript-type': '@loopback/repository#Filter<MyModel>',
              properties: {
                fields: {
                  oneOf: [
                    {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        name: {
                          type: 'boolean',
                        },
                      },
                    },
                    {
                      type: 'array',
                      uniqueItems: true,
                      items: {
                        enum: ['name'],
                        type: 'string',
                        example: 'name',
                      },
                    },
                  ],
                  title: 'MyModel.Fields',
                },
                offset: {type: 'integer', minimum: 0},
                limit: {type: 'integer', minimum: 1, example: 100},
                skip: {type: 'integer', minimum: 0},
                order: {
                  oneOf: [
                    {type: 'string'},
                    {type: 'array', items: {type: 'string'}},
                  ],
                },
              },
              additionalProperties: false,
            },
          },
        },
      },
    ]);
  });

  it('allows @param.where', () => {
    expect(controllerSpec.paths['/count'].get.parameters).to.eql([
      {
        name: 'where',
        in: 'query',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              title: 'MyModel.WhereFilter',
              'x-typescript-type': '@loopback/repository#Where<MyModel>',
              additionalProperties: true,
            },
          },
        },
      },
    ]);
  });

  @model()
  class MyModel extends Model {
    constructor(data: Partial<MyModel>) {
      super(data);
    }
    @property()
    name: string;
  }

  class MyController {
    @get('/')
    async find(
      @param.filter(MyModel)
      filter?: Filter<MyModel>,
    ): Promise<MyModel[]> {
      throw new Error('Not implemented');
    }

    @get('/find')
    async findByQuery(
      @param.filter(MyModel, 'query')
      query?: Filter<MyModel>,
    ): Promise<MyModel[]> {
      throw new Error('Not implemented');
    }

    @get('/search')
    async search(
      @param.filter(MyModel, {name: 'query'})
      query?: Filter<MyModel>,
    ): Promise<MyModel[]> {
      throw new Error('Not implemented');
    }

    @get('/{id}')
    async findById(
      @param.path.string('id') id: string,
      @param.filter(MyModel, {exclude: 'where'})
      filter?: FilterExcludingWhere<MyModel>,
    ): Promise<MyModel> {
      throw new Error('Not implemented');
    }

    @get('/count')
    async count(
      @param.where(MyModel)
      where?: Where<MyModel>,
    ): Promise<Count> {
      throw new Error('Not implemented');
    }
  }
});
