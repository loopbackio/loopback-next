// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-soap-calculator
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, createRestAppClient, expect} from '@loopback/testlab';
import {SoapCalculatorApplication} from '../../application';

describe('Application', function() {
  let app: SoapCalculatorApplication;
  let client: Client;

  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  before(givenAnApplication);

  before(async () => {
    await app.boot();
    await app.start();
    client = createRestAppClient(app);
  });

  after(async () => {
    await app.stop();
  });

  it('rejects division by zero with 412 error', async () => {
    await client.get('/divide/20/0').expect(412);
  });

  it('returns 404 when the "/divide" is missing required args', async () => {
    await client.get('/divide/').expect(404);
  });

  it('returns 404 when the "/multiply" is missing required args', async () => {
    await client.get('/multiply/').expect(404);
  });

  it('returns 404 when the "/add" is missing required args', async () => {
    await client.get('/add/').expect(404);
  });

  it('returns 404 when the "/subtract" is missing required args', async () => {
    await client.get('/subtract/').expect(404);
  });

  it('returns 400 when the "/divide" receives a non integer parameter', async () => {
    await client.get('/divide/10/2.5').expect(400);
  });

  it('returns 400 when the "/multiply" receives a non integer parameter', async () => {
    await client.get('/multiply/50/2.5').expect(400);
  });

  it('returns 400 when the "/add" receives a non integer parameter', async () => {
    await client.get('/add/5/1.2').expect(400);
  });

  it('returns 400 when the "/subtract" receives a non integer parameter', async () => {
    await client.get('/subtract/10/1.1').expect(400);
  });

  it('divides two numbers', async () => {
    const response = await client.get('/divide/50/2').expect(200);
    const answer = {result: {value: 25}};
    expect(response.body).to.containDeep(answer);
  });

  it('adds two numbers', async () => {
    const response = await client.get('/add/25/25').expect(200);
    const answer = {result: {value: 50}};
    expect(response.body).to.containDeep(answer);
  });

  it('multiplies two numbers', async () => {
    const response = await client.get('/multiply/25/3').expect(200);
    const answer = {result: {value: 75}};
    expect(response.body).to.containDeep(answer);
  });

  it('subtracts two numbers', async () => {
    const response = await client.get('/subtract/100/25').expect(200);
    const answer = {result: {value: 75}};
    expect(response.body).to.containDeep(answer);
  });

  function givenAnApplication() {
    app = new SoapCalculatorApplication({
      rest: {
        host: '127.0.0.1',
        port: 0,
      },
    });
  }
});
