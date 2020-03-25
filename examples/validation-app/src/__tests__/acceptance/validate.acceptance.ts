// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect} from '@loopback/testlab';
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
    await client.post('/coffee-shops').send(validCoffeeShop).expect(200);
  });

  it('fails when creating a CoffeeShop with the city name exceeds length limit', async () => {
    const invalidCityNameCS = validCoffeeShop;
    invalidCityNameCS.city = 'Tooooooooooronto';
    await client.post('/coffee-shops').send(invalidCityNameCS).expect(422);
  });

  it('fails when creating a CoffeeShop with an invalid phone number', async () => {
    const invalidPhoneNumCS = validCoffeeShop;
    invalidPhoneNumCS.phoneNum = '1111111111';
    await client.post('/coffee-shops').send(invalidPhoneNumCS).expect(422);
  });

  it('fails when creating a CoffeeShop with the capacity exceeds limit', async () => {
    const invalidCapacityCS = validCoffeeShop;
    invalidCapacityCS.capacity = 10000;
    await client.post('/coffee-shops').send(invalidCapacityCS).expect(422);
  });

  it('fails when creating a CoffeeShop with an invalid area code', async () => {
    const invalidAreaCodeCS = {
      city: 'Toronto',
      phoneNum: '999-111-1111',
      capacity: 10,
    };
    const response = await client.post('/coffee-shops').send(invalidAreaCodeCS);
    expect(response.status).to.eql(400);
    expect(response.body.error.message).to.eql(
      'Area code and city do not match',
    );
  });

  it('fails when creating a CoffeeShop with an invalid type', async () => {
    const invalidCapacityTypeCS = {
      city: 'Toronto',
      phoneNum: '416-111-1111',
      capacity: '10',
    };
    const response = await client
      .post('/coffee-shops')
      .send(invalidCapacityTypeCS)
      .expect(422);

    // with customized response
    expect(response.body).to.have.property('resolution');
  });
});
