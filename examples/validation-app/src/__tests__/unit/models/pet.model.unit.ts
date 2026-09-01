// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Cat, CatProperties, Dog, DogProperties, Pet} from '../../../models';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Pet Models (unit)', () => {
  describe('Pet', () => {
    it('creates a Pet instance with required properties', () => {
      const pet = new Pet();
      pet.name = 'Buddy';
      pet.weight = 10;
      pet.kind = 'Dog';
      expect(pet).to.be.instanceOf(Pet);
      expect(pet.name).to.equal('Buddy');
      expect(pet.weight).to.equal(10);
      expect(pet.kind).to.equal('Dog');
    });

    it('creates a Pet instance without optional weight', () => {
      const pet = new Pet();
      pet.name = 'Buddy';
      pet.kind = 'Dog';
      expect(pet).to.be.instanceOf(Pet);
      expect(pet.weight).to.be.undefined();
    });

    it('has name as required string property', () => {
      expect(Pet.definition.properties.name.type).to.equal(String);
      expect(Pet.definition.properties.name.required).to.be.true();
    });

    it('has weight as optional number property', () => {
      expect(Pet.definition.properties.weight.type).to.equal(Number);
      expect(Pet.definition.properties.weight.required).to.be.false();
    });
  });

  describe('Dog', () => {
    it('creates a Dog instance with valid properties', () => {
      const dogProps = new DogProperties();
      dogProps.breed = 'Labrador';
      dogProps.barkVolume = 8;
      const dog = new Dog();
      dog.name = 'Rex';
      dog.weight = 30;
      dog.kind = 'Dog';
      dog.animalProperties = dogProps;
      expect(dog).to.be.instanceOf(Dog);
      expect(dog).to.be.instanceOf(Pet);
      expect(dog.name).to.equal('Rex');
      expect(dog.weight).to.equal(30);
      expect(dog.kind).to.equal('Dog');
      expect(dog.animalProperties).to.equal(dogProps);
    });

    it('has kind property with Dog enum constraint', () => {
      const kindProperty = Dog.definition.properties.kind as any;
      expect(kindProperty.type).to.equal(String);
      expect(kindProperty.required).to.be.true();
      expect(kindProperty.jsonSchema.enum).to.deepEqual(['Dog']);
    });

    it('has animalProperties as required DogProperties type', () => {
      const animalPropsProperty = Dog.definition.properties
        .animalProperties as any;
      expect(animalPropsProperty.type).to.equal(DogProperties);
      expect(animalPropsProperty.required).to.be.true();
    });

    it('serializes to JSON correctly', () => {
      const dogProps = new DogProperties();
      dogProps.breed = 'Labrador';
      dogProps.barkVolume = 8;
      const dog = new Dog();
      dog.name = 'Rex';
      dog.weight = 30;
      dog.kind = 'Dog';
      dog.animalProperties = dogProps;
      const json = dog.toJSON();
      expect((json as any).name).to.equal('Rex');
      expect((json as any).kind).to.equal('Dog');
    });
  });

  describe('Cat', () => {
    it('creates a Cat instance with valid properties', () => {
      const catProps = new CatProperties();
      catProps.color = 'orange';
      catProps.whiskerLength = 3;
      const cat = new Cat();
      cat.name = 'Whiskers';
      cat.weight = 5;
      cat.kind = 'Cat';
      cat.animalProperties = catProps;
      expect(cat).to.be.instanceOf(Cat);
      expect(cat).to.be.instanceOf(Pet);
      expect(cat.name).to.equal('Whiskers');
      expect(cat.weight).to.equal(5);
      expect(cat.kind).to.equal('Cat');
      expect(cat.animalProperties).to.equal(catProps);
    });

    it('has kind property with Cat enum constraint', () => {
      const kindProperty = Cat.definition.properties.kind as any;
      expect(kindProperty.type).to.equal(String);
      expect(kindProperty.required).to.be.true();
      expect(kindProperty.jsonSchema.enum).to.deepEqual(['Cat']);
    });

    it('has animalProperties as required CatProperties type', () => {
      const animalPropsProperty = Cat.definition.properties
        .animalProperties as any;
      expect(animalPropsProperty.type).to.equal(CatProperties);
      expect(animalPropsProperty.required).to.be.true();
    });

    it('serializes to JSON correctly', () => {
      const catProps = new CatProperties();
      catProps.color = 'orange';
      catProps.whiskerLength = 3;
      const cat = new Cat();
      cat.name = 'Whiskers';
      cat.weight = 5;
      cat.kind = 'Cat';
      cat.animalProperties = catProps;
      const json = cat.toJSON();
      expect((json as any).name).to.equal('Whiskers');
      expect((json as any).kind).to.equal('Cat');
    });
  });

  describe('DogProperties', () => {
    it('creates a DogProperties instance', () => {
      const dogProps = new DogProperties();
      dogProps.breed = 'Poodle';
      dogProps.barkVolume = 5;
      expect(dogProps).to.be.instanceOf(DogProperties);
      expect(dogProps.breed).to.equal('Poodle');
      expect(dogProps.barkVolume).to.equal(5);
    });

    it('has breed as required string property', () => {
      expect(DogProperties.definition.properties.breed.type).to.equal(String);
      expect(DogProperties.definition.properties.breed.required).to.be.true();
    });

    it('has barkVolume as required number property', () => {
      expect(DogProperties.definition.properties.barkVolume.type).to.equal(
        Number,
      );
      expect(
        DogProperties.definition.properties.barkVolume.required,
      ).to.be.true();
    });

    it('serializes to JSON correctly', () => {
      const dogProps = new DogProperties();
      dogProps.breed = 'Poodle';
      dogProps.barkVolume = 5;
      const json = dogProps.toJSON();
      expect(json).to.deepEqual({
        breed: 'Poodle',
        barkVolume: 5,
      });
    });
  });

  describe('CatProperties', () => {
    it('creates a CatProperties instance', () => {
      const catProps = new CatProperties();
      catProps.color = 'black';
      catProps.whiskerLength = 4;
      expect(catProps).to.be.instanceOf(CatProperties);
      expect(catProps.color).to.equal('black');
      expect(catProps.whiskerLength).to.equal(4);
    });

    it('has color as required string property', () => {
      expect(CatProperties.definition.properties.color.type).to.equal(String);
      expect(CatProperties.definition.properties.color.required).to.be.true();
    });

    it('has whiskerLength as required number property', () => {
      expect(CatProperties.definition.properties.whiskerLength.type).to.equal(
        Number,
      );
      expect(
        CatProperties.definition.properties.whiskerLength.required,
      ).to.be.true();
    });

    it('serializes to JSON correctly', () => {
      const catProps = new CatProperties();
      catProps.color = 'black';
      catProps.whiskerLength = 4;
      const json = catProps.toJSON();
      expect(json).to.deepEqual({
        color: 'black',
        whiskerLength: 4,
      });
    });
  });

  describe('Discriminator pattern', () => {
    it('allows Dog and Cat to extend Pet with different properties', () => {
      const dogProps = new DogProperties();
      dogProps.breed = 'Labrador';
      dogProps.barkVolume = 8;
      const dog = new Dog();
      dog.name = 'Rex';
      dog.kind = 'Dog';
      dog.animalProperties = dogProps;

      const catProps = new CatProperties();
      catProps.color = 'orange';
      catProps.whiskerLength = 3;
      const cat = new Cat();
      cat.name = 'Whiskers';
      cat.kind = 'Cat';
      cat.animalProperties = catProps;

      expect(dog.kind).to.equal('Dog');
      expect(cat.kind).to.equal('Cat');
      expect((dog.animalProperties as DogProperties).breed).to.equal(
        'Labrador',
      );
      expect((cat.animalProperties as CatProperties).color).to.equal('orange');
    });
  });
});

// Made with Bob
