// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ComponentsSpecBuilder,
  OpenApiSpecBuilder,
  OperationSpecBuilder,
} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {ConsolidateSpecEnhancer} from '../../..';

const specEnhancer = new ConsolidateSpecEnhancer();

describe('consolidateSchemaObjects', () => {
  it('moves schema with title to component.schemas, replace with reference', () => {
    const inputSpec = new OpenApiSpecBuilder()
      .withOperation(
        'get',
        '/',
        new OperationSpecBuilder().withResponse(200, {
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

    const expectedSpec = new OpenApiSpecBuilder()
      .withOperation(
        'get',
        '/',
        new OperationSpecBuilder().withResponse(200, {
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
        new ComponentsSpecBuilder().withSchema('loopback.example', {
          title: 'loopback.example',
          properties: {
            test: {
              type: 'string',
            },
          },
        }),
      )
      .build();

    expect(specEnhancer.modifySpec(inputSpec)).to.eql(expectedSpec);
  });

  it('ignores schema without title property', () => {
    const inputSpec = new OpenApiSpecBuilder()
      .withOperation(
        'get',
        '/',
        new OperationSpecBuilder().withResponse(200, {
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

    expect(specEnhancer.modifySpec(inputSpec)).to.eql(inputSpec);
  });

  it('Avoids naming collision', () => {
    const inputSpec = new OpenApiSpecBuilder()
      .withOperation(
        'get',
        '/',
        new OperationSpecBuilder().withResponse(200, {
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
        new ComponentsSpecBuilder().withSchema('loopback.example', {
          title: 'Different loopback.example exists',
          properties: {
            testDiff: {
              type: 'string',
            },
          },
        }),
      )
      .build();

    const expectedSpec = new OpenApiSpecBuilder()
      .withOperation(
        'get',
        '/',
        new OperationSpecBuilder().withResponse(200, {
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
        new ComponentsSpecBuilder()
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

    expect(specEnhancer.modifySpec(inputSpec)).to.eql(expectedSpec);
  });
});
