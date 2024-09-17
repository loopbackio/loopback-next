import {Model, model, property} from '@loopback/repository';

@model()
export class CatProperties extends Model {
  @property({
    type: String,
    required: true,
  })
  color: string;

  @property({
    type: Number,
    required: false,
  })
  whiskerLength?: number;
}

@model()
export class DogProperties extends Model {
  @property({
    type: String,
    required: true,
  })
  breed: string;

  @property({
    type: Number,
    required: false,
  })
  barkVolume?: number;
}

@model()
export class Pet extends Model {
  @property({
    type: String,
    required: true,
  })
  name: string;

  @property({
    type: Number,
    required: false,
  })
  weight?: number;

  kind: string;

  animalProperties: CatProperties | DogProperties;
}

@model()
export class Dog extends Pet {
  @property({
    type: String,
    jsonSchema: {
      enum: ['Dog'],
    },
    required: true,
  })
  kind: string;

  @property({
    type: DogProperties,
    required: true,
  })
  animalProperties: DogProperties;
}

@model()
export class Cat extends Pet {
  @property({
    type: String,
    jsonSchema: {
      enum: ['Cat'],
    },
    required: true,
  })
  kind: string;

  @property({
    type: CatProperties,
    required: true,
  })
  animalProperties: CatProperties;
}
