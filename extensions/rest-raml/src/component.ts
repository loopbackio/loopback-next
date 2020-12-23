import {
  Application,
  Binding,
  BindingCreationPolicy,
  Component,
  CoreBindings,
  inject,
  Setter
} from '@loopback/core';
import {OpenApiSpec, RestBindings} from '@loopback/rest';
import {WebApiParser} from 'webapi-parser';
import {RestRamlBindings} from './keys';

export class RestRamlComponent implements Component {
  @inject.binding(RestBindings.API_SPEC, {
    bindingCreation: BindingCreationPolicy.CREATE_IF_NOT_BOUND,
  })
  private oasSpecBinding: Binding<OpenApiSpec>;

  @inject(CoreBindings.APPLICATION_INSTANCE)
  private app: Application;

  @inject.setter(RestRamlBindings.RAML_SPEC, {
    bindingCreation: BindingCreationPolicy.CREATE_IF_NOT_BOUND,
  })
  private ramlSpecSetter: Setter<string>;

  constructor() {
    this.oasSpecBinding.on('changed', ({operation}) => {
      if (operation !== 'to') return;

      WebApiParser.oas30
        .parse(this.app.getSync(this.oasSpecBinding.key))
        .then(baseUnit => {
          WebApiParser.raml10
            .generateString(baseUnit)
            .then(raml10Spec => {
              this.ramlSpecSetter(raml10Spec);
            })
            .catch(err => {
              throw err;
            });
        })
        .catch(err => {
          throw err;
        });
    });
  }
}
