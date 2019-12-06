// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {defineModelClass, Entity, Model, ModelDefinition} from '../../..';
import {AnyObject} from '../../../common-types';

describe('defineModelClass', () => {
  it('creates a Model class', () => {
    const definition = new ModelDefinition(
      'DataTransferObject',
    ).addProperty('title', {type: 'string'});

    const DataTransferObject = defineModelClass<typeof Model, {title: string}>(
      Model,
      definition,
    );
    expect(DataTransferObject.prototype).instanceof(Model);

    // Verify that typedefs allows us to access static Model properties
    expect(DataTransferObject.modelName).to.equal('DataTransferObject');
    expect(DataTransferObject.definition).to.equal(definition);

    // Verify that typedefs allows us to create new model instances
    const instance = new DataTransferObject({title: 'a title'});
    // Verify that typedefs allows us to call Model methods
    expect(instance.toJSON()).to.deepEqual({title: 'a title'});
    // Verify that typedefs allows us to access known properties
    expect(instance.title).to.equal('a title');
  });

  it('creates an Entity class', () => {
    const definition = new ModelDefinition('Product')
      .addProperty('id', {type: 'number', id: true})
      .addProperty('name', {
        type: 'string',
      });

    const Product = defineModelClass<typeof Entity, {id: number; name: string}>(
      Entity,
      definition,
    );
    expect(Product.prototype).instanceof(Entity);

    // Verify that typedefs allows us to access static Model properties
    expect(Product.modelName).to.equal('Product');
    expect(Product.definition).to.equal(definition);

    // Verify that typedefs allows us to access static Entity properties
    expect(Product.getIdProperties()).to.deepEqual(['id']);

    // Verify that typedefs allows us to create new model instances
    const instance = new Product({id: 1, name: 'a name'});
    // Verify that typedefs allows us to call Entity methods
    expect(instance.getId()).to.equal(1);
    // Verify that typedefs allows us to call Model methods
    expect(instance.toJSON()).to.deepEqual({id: 1, name: 'a name'});
    // Verify that typedefs allows us to access known properties
    expect(instance.name).to.equal('a name');
  });

  it('creates a free-form Entity', () => {
    const definition = new ModelDefinition('FreeForm')
      .addProperty('id', {type: 'number', id: true})
      .addSetting('strict', false);

    const FreeForm = defineModelClass<typeof Entity, AnyObject>(
      Entity,
      definition,
    );
    expect(FreeForm.prototype).instanceof(Entity);

    // Verify that typedefs allows us to access static Model properties
    expect(FreeForm.modelName).to.equal('FreeForm');
    expect(FreeForm.definition).to.equal(definition);

    // Verify that typedefs allows us to access static Entity properties
    expect(FreeForm.getIdProperties()).to.deepEqual(['id']);

    // Verify that typedefs allows us to create new model instances
    const instance = new FreeForm({id: 1, name: 'a name'});
    // Verify that typedefs allows us to call Entity methods
    expect(instance.getId()).to.equal(1);
    // Verify that typedefs allows us to call Model methods
    expect(instance.toJSON()).to.deepEqual({id: 1, name: 'a name'});
    // Verify that typedefs allows us to access free-form properties
    expect(instance.name).to.equal('a name');
  });
});
