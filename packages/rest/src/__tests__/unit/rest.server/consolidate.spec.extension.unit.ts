// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, createBindingFromClass} from '@loopback/core';
import {
  aComponentsSpec,
  anOpenApiSpec,
  anOperationSpec,
} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {ConsolidationEnhancer} from '../../../spec-enhancers/consolidate.spec-enhancer';

describe('ConsolidationEnhancer', () => {
  let consolidationEnhancer: ConsolidationEnhancer;

  beforeEach(() => {
    const ctx = new Application();
    const consolidationEnhancerBinding = createBindingFromClass(
      ConsolidationEnhancer,
    );
    ctx.add(consolidationEnhancerBinding);

    consolidationEnhancer = ctx.getSync<ConsolidationEnhancer>(
      consolidationEnhancerBinding.key,
    );
  });

  it('moves schema with title to component.schemas, replaces with reference', async () => {
    const INPUT_SPEC = anOpenApiSpec()
      .withOperation(
        'get',
        '/',
        anOperationSpec().withResponse(200, {
          description: 'Example',
          content: {
            'application/json': {
              schema: {
                title: 'loopback.example',
                properties: {
                  test: {
                    type: 'string',
                  },
                },
              },
            },
          },
        }),
      )
      .build();

    const EXPECTED_SPEC = anOpenApiSpec()
      .withOperation(
        'get',
        '/',
        anOperationSpec().withResponse(200, {
          description: 'Example',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/loopback.example',
              },
            },
          },
        }),
      )
      .withComponents(
        aComponentsSpec().withSchema('loopback.example', {
          title: 'loopback.example',
          properties: {
            test: {
              type: 'string',
            },
          },
        }),
      )
      .build();

    expect(await consolidationEnhancer.modifySpec(INPUT_SPEC)).to.eql(
      EXPECTED_SPEC,
    );
  });

  it('ignores schema without title property', async () => {
    const INPUT_SPEC = anOpenApiSpec()
      .withOperation(
        'get',
        '/',
        anOperationSpec().withResponse(200, {
          description: 'Example',
          content: {
            'application/json': {
              schema: {
                properties: {
                  test: {
                    type: 'string',
                  },
                },
              },
            },
          },
        }),
      )
      .build();

    expect(await consolidationEnhancer.modifySpec(INPUT_SPEC)).to.eql(
      INPUT_SPEC,
    );
  });

  it('avoids naming collision', async () => {
    const INPUT_SPEC = anOpenApiSpec()
      .withOperation(
        'get',
        '/',
        anOperationSpec().withResponse(200, {
          description: 'Example',
          content: {
            'application/json': {
              schema: {
                title: 'loopback.example',
                properties: {
                  test: {
                    type: 'string',
                  },
                },
              },
            },
          },
        }),
      )
      .withComponents(
        aComponentsSpec().withSchema('loopback.example', {
          title: 'Different loopback.example exists',
          properties: {
            testDiff: {
              type: 'string',
            },
          },
        }),
      )
      .build();

    const EXPECTED_SPEC = anOpenApiSpec()
      .withOperation(
        'get',
        '/',
        anOperationSpec().withResponse(200, {
          description: 'Example',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/loopback.example1',
              },
            },
          },
        }),
      )
      .withComponents(
        aComponentsSpec()
          .withSchema('loopback.example', {
            title: 'Different loopback.example exists',
            properties: {
              testDiff: {
                type: 'string',
              },
            },
          })
          .withSchema('loopback.example1', {
            title: 'loopback.example',
            properties: {
              test: {
                type: 'string',
              },
            },
          }),
      )
      .build();

    expect(await consolidationEnhancer.modifySpec(INPUT_SPEC)).to.eql(
      EXPECTED_SPEC,
    );
  });

  it('consolidates same schema in multiple locations', async () => {
    const INPUT_SPEC = anOpenApiSpec()
      .withOperation(
        'get',
        // first time has 'loopback.example'
        '/path1',
        anOperationSpec().withResponse(200, {
          description: 'Example',
          content: {
            'application/json': {
              schema: {
                title: 'loopback.example',
                properties: {
                  test: {
                    type: 'string',
                  },
                },
              },
            },
          },
        }),
      )
      .withOperation(
        'get',
        // second time has 'loopback.example'
        '/path2',
        anOperationSpec().withResponse(200, {
          description: 'Example',
          content: {
            'application/json': {
              schema: {
                title: 'loopback.example',
                properties: {
                  test: {
                    type: 'string',
                  },
                },
              },
            },
          },
        }),
      )
      .build();

    const EXPECTED_SPEC = anOpenApiSpec()
      .withOperation(
        'get',
        '/path1',
        anOperationSpec().withResponse(200, {
          description: 'Example',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/loopback.example',
              },
            },
          },
        }),
      )
      .withOperation(
        'get',
        '/path2',
        anOperationSpec().withResponse(200, {
          description: 'Example',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/loopback.example',
              },
            },
          },
        }),
      )
      .withComponents(
        aComponentsSpec().withSchema('loopback.example', {
          title: 'loopback.example',
          properties: {
            test: {
              type: 'string',
            },
          },
        }),
      )
      .build();

    expect(await consolidationEnhancer.modifySpec(INPUT_SPEC)).to.eql(
      EXPECTED_SPEC,
    );
  });
});
