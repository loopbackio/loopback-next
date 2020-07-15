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
    const invalidCityNameCS = {...validCoffeeShop};
    invalidCityNameCS.city = 'Tooooooooooronto';
    const response = await client
      .post('/coffee-shops')
      .send(invalidCityNameCS)
      .expect(422);
    expect(response.body.error.details.length).to.equal(1);
    expect(response.body.error.details[0].message).to.equal(
      'City name should be between 5 and 10 characters',
    );
  });

  it('fails when creating a CoffeeShop with an invalid phone number', async () => {
    const invalidPhoneNumCS = {...validCoffeeShop};
    invalidPhoneNumCS.phoneNum = '1111111111';
    const response = await client
      .post('/coffee-shops')
      .send(invalidPhoneNumCS)
      .expect(422);
    expect(response.body.error.details.length).to.equal(1);
    expect(response.body.error.details[0].message).to.equal(
      'Invalid phone number',
    );
  });

  it('fails when creating a CoffeeShop with the capacity exceeds limit', async () => {
    const invalidCapacityCS = {...validCoffeeShop};
    invalidCapacityCS.capacity = 10000;
    const response = await client
      .post('/coffee-shops')
      .send(invalidCapacityCS)
      .expect(422);
    expect(response.body.error.details.length).to.equal(1);
    expect(response.body.error.details[0].message).to.equal(
      'Capacity cannot exceed 100',
    );
  });

  it('should report all validation errors', async () => {
    const invalidCapacityTypeCS = {
      city: '',
      phoneNum: '',
      capacity: 0,
      rating: '',
    };
    const response = await client
      .post('/coffee-shops')
      .send(invalidCapacityTypeCS)
      .expect(422);

    expect(response.body.error.message).to.equal(
      'The request body is invalid. See error object `details` property for more info.',
    );
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.body.error.details.map((d: any) => d.message),
    ).to.deepEqual([
      'City name should be between 5 and 10 characters',
      'Invalid phone number',
      'Capacity cannot be less than 1',
      'Rating should be between 1 and 5',
    ]);
  });

  it('should apply controller-level custom validations', async () => {
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

  // The example app uses a custom sequence handler, which catches all the errors
  // encountered on '/coffee-shops'. If the request method is 'PATCH', it modifies
  // the error body (a demonstration of how to customize error messages during
  // runtime). The test below is specifically for this behavior.

  it('should use sequence-level custom error handler', async () => {
    const invalidCapacityTypeCS = {
      city: 'Toronto',
      phoneNum: '416-111-1111',
      capacity: '10',
    };
    const response = await client
      .patch('/coffee-shops')
      .send(invalidCapacityTypeCS)
      .expect(422);

    // with customized response
    expect(response.body).to.have.property('resolution');
  });
});
