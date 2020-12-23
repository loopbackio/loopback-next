import {RestApplication, RestBindings} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {WebApiParser} from 'webapi-parser';
import {RestRamlBindings, RestRamlComponent} from '../../';
import {PingController} from '../fixtures';

describe('RestRamlComponent', () => {
  it('generates RAML spec from OpenAPI 3.0 spec', async () => {
    const app = new RestApplication();
    app.component(RestRamlComponent);
    app.controller(PingController);
    app.onStart(async () => {
      const oasSpec = await app.get(RestBindings.API_SPEC);
      const generatedRamlSpec = await app.get(RestRamlBindings.RAML_SPEC);
      const expectedRamlSpec = await WebApiParser.raml10.resolve(
        await WebApiParser.oas30.parse(JSON.stringify(oasSpec)),
      );
      await app.stop();
      expect(generatedRamlSpec).to.deepEqual(expectedRamlSpec);
    });
    await app.start();
  });
});
