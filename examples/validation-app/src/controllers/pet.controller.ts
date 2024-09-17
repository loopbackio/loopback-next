// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {post, requestBody} from '@loopback/rest';
import {Cat, Dog, Pet} from '../models';

export class PetController {
  constructor() {}

  @post('/pets', {
    responses: {
      '200': {
        description: 'Pet model instance',
        content: {
          'application/json': {
            schema: {'x-ts-type': Pet},
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            required: ['kind'],
            discriminator: {
              propertyName: 'kind',
            },
            oneOf: [{'x-ts-type': Cat}, {'x-ts-type': Dog}],
          },
        },
      },
    })
    request: Pet,
  ): Promise<Pet> {
    return request;
  }
}
