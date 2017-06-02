// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { expect } from '@loopback/testlab';
import { STRING } from '../../../src/types';
import { Model, Entity, ModelDefinition, PropertyDefinition } from '../../../src/model';

describe('model', () => {

  it('adds properties', () => {
    const modelDef = new ModelDefinition('Customer');
    modelDef.addProperty(new PropertyDefinition('id', 'string'))
      .addProperty('email', 'string').addProperty('firstName', String)
      .addProperty('lastName', STRING)
      .addSetting('key', ['id']);
    expect(modelDef.name).to.eql('Customer');
    expect(modelDef.properties).have.properties('id', 'email', 'lastName', 'firstName');
    expect(modelDef.properties.lastName).to.eql(
      new PropertyDefinition('lastName', STRING));
  });

  /*
  class CustomerModel extends Entity {
    static modelName = 'Customer';
    static definition = modelDef;
  }
  */
});
