// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client} from '@loopback/testlab';
import {ValidationApplication} from '../..';
import {setupApplication} from './test-helper';

const validCoffeeShop = {
  city: 'Toronto',
  phoneNum: '416-111-1111',
  capacity: 10,
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

  it('can create CoffeeShop with valid properties', async () => {
    await client
      .post('/coffee-shops')
      .send(validCoffeeShop)
      .expect(200);
  });

  it('create CoffeeShop failed with city name exceeds length limit', async () => {
    const invalidCityNameCS = validCoffeeShop;
    invalidCityNameCS.city = 'Tooooooooooronto';
    await client
      .post('/coffee-shops')
      .send(invalidCityNameCS)
      .expect(422);
  });

  it('create CoffeeShop failed with invalid phone number', async () => {
    const invalidPhoneNumCS = validCoffeeShop;
    invalidPhoneNumCS.phoneNum = '1111111111';
    await client
      .post('/coffee-shops')
      .send(invalidPhoneNumCS)
      .expect(422);
  });

  it('create CoffeeShop failed with capacity exceeds limit', async () => {
    const invalidCapacityCS = validCoffeeShop;
    invalidCapacityCS.capacity = 10000;
    await client
      .post('/coffee-shops')
      .send(invalidCapacityCS)
      .expect(422);
  });

  it('create CoffeeShop failed with invalid area code', async () => {
    const invalidAreaCodeCS = {
      city: 'Toronto',
      phoneNum: '999-111-1111',
      capacity: 10,
    };
    await client
      .post('/coffee-shops')
      .send(invalidAreaCodeCS)
      .expect(422);
  });
});
