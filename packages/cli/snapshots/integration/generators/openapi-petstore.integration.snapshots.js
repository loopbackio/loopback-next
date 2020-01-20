// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`openapi-generator specific files generates all the proper files 1`] = `
export * from './pet.model';
export * from './new-pet.model';
export * from './error.model';

`;


exports[`openapi-generator specific files generates all the proper files 2`] = `
export * from './open-api.controller';

`;


exports[`openapi-generator specific files generates all the proper files 3`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
import {operation, param, requestBody} from '@loopback/rest';
import {Pet} from '../models/pet.model';
import {NewPet} from '../models/new-pet.model';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by 
 * 
 */
export class OpenApiController {
  constructor() {}

  /**
   * Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.

   * 

   * @param tags tags to filter by
   * @param limit maximum number of results to return
   * @returns pet response
   */
  @operation('get', '/pets')
  async findPets(@param({name: 'tags', in: 'query'}) tags: string[], @param({name: 'limit', in: 'query'}) limit: number): Promise<Pet[]> {
    throw new Error('Not implemented');
  }

  /**
   * Creates a new pet in the store.  Duplicates are allowed
   * 

   * @param _requestBody Pet to add to the store
   * @returns pet response
   */
  @operation('post', '/pets')
  async addPet(@requestBody() _requestBody: NewPet): Promise<Pet> {
    throw new Error('Not implemented');
  }

  /**
   * Returns a user based on a single ID, if the user does not have access to the pet
   * 

   * @param id ID of pet to fetch
   * @returns pet response
   */
  @operation('get', '/pets/{id}')
  async findPetById(@param({name: 'id', in: 'path'}) id: number): Promise<Pet> {
    throw new Error('Not implemented');
  }

  /**
   * deletes a single pet based on the ID supplied
   * 

   * @param id ID of pet to delete
   */
  @operation('delete', '/pets/{id}')
  async deletePet(@param({name: 'id', in: 'path'}) id: number): Promise<any> {
    throw new Error('Not implemented');
  }

}


`;


exports[`openapi-generator specific files generates all the proper files 4`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
import {NewPet} from './new-pet.model';
/**
 * The model type is generated from OpenAPI schema - Pet
 * Pet
 */
export type Pet = NewPet & {
  id: number;
};


`;


exports[`openapi-generator specific files generates all the proper files 5`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - NewPet
 * NewPet
 */
@model({name: 'NewPet'})
export class NewPet {
  constructor(data?: Partial<NewPet>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * 
   */
  @property({required: true})
  name: string;

  /**
   * 
   */
  @property()
  tag?: string;

}

export interface NewPetRelations {
  // describe navigational properties here
}

export type NewPetWithRelations = NewPet & NewPetRelations;



`;


exports[`openapi-generator specific files generates all the proper files 6`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - Error
 * Error
 */
@model({name: 'Error'})
export class Error {
  constructor(data?: Partial<Error>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * 
   */
  @property({required: true})
  code: number;

  /**
   * 
   */
  @property({required: true})
  message: string;

}

export interface ErrorRelations {
  // describe navigational properties here
}

export type ErrorWithRelations = Error & ErrorRelations;



`;
