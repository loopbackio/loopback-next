// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {getModelSchemaRef} from '@loopback/openapi-v3';
import {defineModelClass, Model, ModelDefinition} from '@loopback/repository';
import {expect} from '@loopback/testlab';

describe('defineModelClass', () => {
  it('should include model definition details in generated Model class', () => {
    const definition = new ModelDefinition('Book').addProperty('title', {
      type: 'string',
    });

    const Book = defineModelClass<typeof Model, {title: string}>(
      Model,
      definition,
    );

    const schemaRef = getModelSchemaRef(Book);
    const expected = {
      $ref: '#/components/schemas/Book',
      definitions: {
        Book: {title: 'Book', type: 'object', additionalProperties: false},
      },
    };
    expect(schemaRef).to.match(expected);
  });
});
