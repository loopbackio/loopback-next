// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {assignRouterSpec, RouterSpec} from '../../../';

describe('assignRouterSpec', () => {
  it('duplicates the additions spec if the target spec is empty', async () => {
    const target: RouterSpec = {paths: {}};
    const additions: RouterSpec = {
      paths: {
        '/': {
          get: {
            responses: {
              '200': {
                description: 'greeting',
                content: {
                  'application/json': {
                    schema: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Greeting: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
              },
            },
          },
        },
      },
      tags: [{name: 'greeting', description: 'greetings'}],
    };

    assignRouterSpec(target, additions);
    expect(target).to.eql(additions);
  });

  it('does not assign components without schema', async () => {
    const target: RouterSpec = {
      paths: {},
      components: {},
    };

    const additions: RouterSpec = {
      paths: {},
      components: {
        parameters: {
          addParam: {
            name: 'add',
            in: 'query',
            description: 'number of items to add',
            required: true,
            schema: {
              type: 'integer',
              format: 'int32',
            },
          },
        },
        responses: {
          Hello: {
            description: 'Hello.',
          },
        },
      },
    };

    assignRouterSpec(target, additions);
    expect(target.components).to.be.empty();
  });

  it('uses the route registered first', async () => {
    const originalPath = {
      '/': {
        get: {
          responses: {
            '200': {
              description: 'greeting',
              content: {
                'application/json': {
                  schema: {type: 'string'},
                },
              },
            },
          },
        },
      },
    };

    const target: RouterSpec = {paths: originalPath};

    const additions: RouterSpec = {
      paths: {
        '/': {
          get: {
            responses: {
              '200': {
                description: 'additional greeting',
                content: {
                  'application/json': {
                    schema: {type: 'string'},
                  },
                },
              },
              '404': {
                description: 'Error: no greeting',
                content: {
                  'application/json': {
                    schema: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    };

    assignRouterSpec(target, additions);
    expect(target.paths).to.eql(originalPath);
  });

  it('does not duplicate tags from the additional spec', async () => {
    const target: RouterSpec = {
      paths: {},
      tags: [{name: 'greeting', description: 'greetings'}],
    };
    const additions: RouterSpec = {
      paths: {},
      tags: [
        {name: 'greeting', description: 'additional greetings'},
        {name: 'salutation', description: 'salutations!'},
      ],
    };

    assignRouterSpec(target, additions);
    expect(target.tags).to.containDeep([
      {name: 'greeting', description: 'greetings'},
      {name: 'salutation', description: 'salutations!'},
    ]);
  });
});
