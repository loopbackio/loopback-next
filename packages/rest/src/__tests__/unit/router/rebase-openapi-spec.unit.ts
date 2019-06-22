// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {rebaseOpenApiSpec} from '../../../router';

describe('rebaseOpenApiSpec', () => {
  it('does not modify an OpenAPI spec if it does not have paths', async () => {
    const spec = {
      title: 'Greetings',
      components: {
        responses: {
          Hello: {
            description: 'Hello.',
          },
        },
      },
      tags: [{name: 'greeting', description: 'greetings'}],
    };
    const rebasedSpec = rebaseOpenApiSpec(spec, '/api');

    expect(rebasedSpec).to.eql(spec);
  });

  it('does not modify the OpenApiSpec if basePath is empty or `/`', async () => {
    const spec = {
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
        '/hello': {
          post: {
            summary: 'says hello',
            consumes: 'application/json',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    };

    let rebasedSpec = rebaseOpenApiSpec(spec, '');
    expect(spec).to.eql(rebasedSpec);

    rebasedSpec = rebaseOpenApiSpec(spec, '/');
    expect(rebasedSpec).to.eql(spec);
  });

  it('rebases OpenApiSpec if there is a basePath', async () => {
    const spec = {
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
        '/hello': {
          post: {
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
    };

    const rebasedSpec = rebaseOpenApiSpec(spec, '/greetings');
    const rebasedPaths = Object.keys(rebasedSpec.paths);

    expect(rebasedPaths).to.eql(['/greetings/', '/greetings/hello']);
  });

  it('does not modify the original OpenApiSpec', async () => {
    const spec = {
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
        '/hello': {
          post: {
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
    };

    rebaseOpenApiSpec(spec, '/greetings');

    const specPaths = Object.keys(spec.paths);
    expect(specPaths).to.deepEqual(['/', '/hello']);
  });
});
