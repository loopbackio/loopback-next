import {Application, BindingEvent} from '@loopback/core';
import {OpenApiBuilder, RestBindings} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {WebApiParser} from 'webapi-parser';
import {RestRamlBindings, RestRamlComponent} from '../../';

describe('RestRamlComponent', () => {
  describe('Component registration', () => {
    describe(`"${RestBindings.API_SPEC}" binding`, () => {
      it('creates new binding if not bound', async () => {
        const app = new Application();
        app.component(RestRamlComponent);
        expect(app.isBound(RestBindings.API_SPEC)).to.be.true();
      });

      it('does not override existing binding', async () => {
        const app = new Application();
        app.bind<string>(RestBindings.API_SPEC).to('existing value');
        app.component(RestRamlComponent);
        const boundValue = await app.get<string>(RestBindings.API_SPEC);
        expect(boundValue).to.equal('existing value');
      });
    });
  });

  describe('RAML generation', () => {
    it('generates expected RAML specification with minimum valid OpenAPI 3 specificaiton', async () => {
      const app = new Application();
      const oas3Spec = new OpenApiBuilder().getSpec();
      app.component(RestRamlComponent);

      const ramlSpecBinding = app.getBinding(RestRamlBindings.RAML_SPEC);

      const ramlSpecBindingHandler = async (event: BindingEvent) => {
        const boundRamlSpec = await app.get(RestRamlBindings.RAML_SPEC);

        const expectedRamlSpec = await WebApiParser.raml10.generateString(
          await WebApiParser.oas30.parse(JSON.stringify(oas3Spec)),
        );

        expect(boundRamlSpec).to.deepEqual(expectedRamlSpec);
      };

      ramlSpecBinding.on('changed', event => {
        ramlSpecBindingHandler(event).catch(err => {
          throw err;
        });
      });

      app.bind(RestBindings.API_SPEC).to(oas3Spec);
    });
  });
});
