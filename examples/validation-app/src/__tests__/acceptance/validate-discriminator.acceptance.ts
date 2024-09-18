// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect} from '@loopback/testlab';
import {ValidationApplication} from '../..';
import {setupApplication} from './test-helper';

const validCat = {
  name: 'Kitty',
  weight: 5,
  kind: 'Cat',
  animalProperties: {
    color: 'grey',
    whiskerLength: 2,
  },
};

const validDog = {
  name: 'Rex',
  weight: 5,
  kind: 'Dog',
  animalProperties: {
    breed: 'poodle',
    barkVolume: 5,
  },
};

describe('validate properties', () => {
  let client: Client;
  let app: ValidationApplication;

  before(givenAClient);

  after(async () => {
    await app.stop();
  });

  async function givenAClient() {
    ({app, client} = await setupApplication());
  }

  it('should pass with valid cat properties', async () => {
    await client.post('/pets').send(validCat).expect(200);
  });

  it('should pass with valid dog properties', async () => {
    await client.post('/pets').send(validDog).expect(200);
  });

  it('should fail with error indicating the invalid barkVolume', async () => {
    const invalidDog = {...validDog};
    invalidDog.animalProperties.barkVolume = 'loud' as unknown as number;
    const response = await client.post('/pets').send(invalidDog).expect(422);

    /*
      below expect statements pass after fixing the bug in function convertToJsonSchema()
      loopback-next/packages/rest/src/validation/request-body.validator.ts#lines-87:99
      a possible solution is indicated under //NOTE
    */
    expect(response.body.error.details.length).to.equal(1);
    expect(response.body.error.details[0].message).to.equal('must be number');
    expect(response.body.error.details).to.deepEqual([
      {
        code: 'type',
        info: {
          type: 'number',
        },
        message: 'must be number',
        path: '/animalProperties/barkVolume',
      },
    ]);
  });
});
