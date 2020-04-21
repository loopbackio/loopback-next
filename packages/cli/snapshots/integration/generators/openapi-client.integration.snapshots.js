// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`generates files with --client and --datasource for an existing datasource 1`] = `
export * from './open-api.service';

`;


exports[`generates files with --client and --datasource for an existing datasource 2`] = `
import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {PetStoreDataSource} from '../datasources';

import {Pet} from '../models/pet.model';
import {NewPet} from '../models/new-pet.model';

/**
 * The service interface is generated from OpenAPI spec with operations tagged
 * by <no-tag>.
 */
export interface OpenApiService {
  /**
   * Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem
sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio
lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar
ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst.
Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante
molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor
eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget
eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac
sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non
augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed
lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu
condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus.
In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus
nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus
ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean
nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque
mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero
lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa
ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium,
pulvinar elit eu, euismod sapien.

   * @param tags tags to filter by
   * @param limit maximum number of results to return
   * @param where 
   * @returns pet response
   */
  findPets(params: { tags: string[]; limit: number; where: {
  [additionalProperty: string]: any;
} }): Promise<Pet[]>;

  /**
   * Creates a new pet in the store. Duplicates are allowed
   * @param _requestBody Pet to add to the store
   * @returns pet response
   */
  addPet(params: { requestBody: NewPet }): Promise<Pet>;

  /**
   * Returns a user based on a single ID, if the user does not have access to the
pet
   * @param id ID of pet to fetch
   * @returns pet response
   */
  findPetById(params: { id: number }): Promise<Pet>;

  /**
   * deletes a single pet based on the ID supplied
   * @param id ID of pet to delete
   */
  deletePet(params: { id: number }): Promise<any>;

}

export class OpenApiServiceProvider implements Provider<OpenApiService> {
  constructor(
    // petStore must match the name property in the datasource json file
    @inject('datasources.petStore')
    protected dataSource: PetStoreDataSource = new PetStoreDataSource(),
  ) {}

  async value(): Promise<OpenApiService> {
    const service = await getService<{apis: {default: OpenApiService}}>(
      this.dataSource,
    );
    return service.apis['default'];
  }
}

`;


exports[`generates files with --client and --datasource for an existing datasource 3`] = `
export * from './pet.model';
export * from './new-pet.model';
export * from './error.model';

`;


exports[`generates files with --client and --datasource for an existing datasource 4`] = `
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


exports[`generates files with --client and --datasource for an existing datasource 5`] = `
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
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  name: string;

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  tag?: string;

}

export interface NewPetRelations {
  // describe navigational properties here
}

export type NewPetWithRelations = NewPet & NewPetRelations;



`;


exports[`generates files with --client and --datasource for an existing datasource 6`] = `
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
  @property({required: true, jsonSchema: {
  type: 'integer',
  format: 'int32',
}})
  code: number;

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  message: string;

}

export interface ErrorRelations {
  // describe navigational properties here
}

export type ErrorWithRelations = Error & ErrorRelations;



`;


exports[`generates files with --client for an existing datasource 1`] = `
export * from './open-api.service';

`;


exports[`generates files with --client for an existing datasource 2`] = `
import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {PetStoreDataSource} from '../datasources';

import {Pet} from '../models/pet.model';
import {NewPet} from '../models/new-pet.model';

/**
 * The service interface is generated from OpenAPI spec with operations tagged
 * by <no-tag>.
 */
export interface OpenApiService {
  /**
   * Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem
sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio
lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar
ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst.
Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante
molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor
eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget
eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac
sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non
augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed
lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu
condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus.
In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus
nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus
ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean
nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque
mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero
lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa
ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium,
pulvinar elit eu, euismod sapien.

   * @param tags tags to filter by
   * @param limit maximum number of results to return
   * @param where 
   * @returns pet response
   */
  findPets(params: { tags: string[]; limit: number; where: {
  [additionalProperty: string]: any;
} }): Promise<Pet[]>;

  /**
   * Creates a new pet in the store. Duplicates are allowed
   * @param _requestBody Pet to add to the store
   * @returns pet response
   */
  addPet(params: { requestBody: NewPet }): Promise<Pet>;

  /**
   * Returns a user based on a single ID, if the user does not have access to the
pet
   * @param id ID of pet to fetch
   * @returns pet response
   */
  findPetById(params: { id: number }): Promise<Pet>;

  /**
   * deletes a single pet based on the ID supplied
   * @param id ID of pet to delete
   */
  deletePet(params: { id: number }): Promise<any>;

}

export class OpenApiServiceProvider implements Provider<OpenApiService> {
  constructor(
    // petStore must match the name property in the datasource json file
    @inject('datasources.petStore')
    protected dataSource: PetStoreDataSource = new PetStoreDataSource(),
  ) {}

  async value(): Promise<OpenApiService> {
    const service = await getService<{apis: {default: OpenApiService}}>(
      this.dataSource,
    );
    return service.apis['default'];
  }
}

`;


exports[`generates files with --client for an existing datasource 3`] = `
export * from './pet.model';
export * from './new-pet.model';
export * from './error.model';

`;


exports[`generates files with --client for an existing datasource 4`] = `
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


exports[`generates files with --client for an existing datasource 5`] = `
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
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  name: string;

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  tag?: string;

}

export interface NewPetRelations {
  // describe navigational properties here
}

export type NewPetWithRelations = NewPet & NewPetRelations;



`;


exports[`generates files with --client for an existing datasource 6`] = `
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
  @property({required: true, jsonSchema: {
  type: 'integer',
  format: 'int32',
}})
  code: number;

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  message: string;

}

export interface ErrorRelations {
  // describe navigational properties here
}

export type ErrorWithRelations = Error & ErrorRelations;



`;


exports[`openapi-generator with --client does not generates files for client with --no-client 1`] = `
export * from './open-api.controller';

`;


exports[`openapi-generator with --client does not generates files for client with --no-client 2`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
import {api, operation, param, requestBody} from '@loopback/rest';
import {Pet} from '../models/pet.model';
import {NewPet} from '../models/new-pet.model';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by <no-tag>.
 *
 */
@api({
  components: {
    schemas: {
      Pet: {
        allOf: [
          {
            $ref: '#/components/schemas/NewPet',
          },
          {
            required: [
              'id',
            ],
            properties: {
              id: {
                type: 'integer',
                format: 'int64',
              },
            },
          },
        ],
      },
      NewPet: {
        required: [
          'name',
        ],
        properties: {
          name: {
            type: 'string',
          },
          tag: {
            type: 'string',
          },
        },
      },
      Error: {
        required: [
          'code',
          'message',
        ],
        properties: {
          code: {
            type: 'integer',
            format: 'int32',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
  paths: {},
})
export class OpenApiController {
  constructor() {}

  /**
   * Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem
sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio
lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar
ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst.
Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante
molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor
eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget
eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac
sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non
augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed
lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu
condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus.
In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus
nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus
ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean
nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque
mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero
lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa
ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium,
pulvinar elit eu, euismod sapien.

   *
   * @param tags tags to filter by
   * @param limit maximum number of results to return
   * @param where 
   * @returns pet response
   */
  @operation('get', '/pets', {
  description: 'Returns all pets from the system that the user has access to\\nNam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.\\n\\nSed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.\\n',
  operationId: 'findPets',
  parameters: [
    {
      name: 'tags',
      in: 'query',
      description: 'tags to filter by',
      required: false,
      style: 'form',
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    {
      name: 'limit',
      in: 'query',
      description: 'maximum number of results to return',
      required: false,
      schema: {
        type: 'integer',
        format: 'int32',
      },
    },
    {
      name: 'where',
      in: 'query',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            'title"': 'TodoList.WhereFilter',
            additionalProperties: true,
          },
        },
      },
    },
  ],
  responses: {
    '200': {
      description: 'pet response',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Pet',
            },
          },
        },
      },
    },
    default: {
      description: 'unexpected error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  },
})
  async findPets(@param({
  name: 'tags',
  in: 'query',
  description: 'tags to filter by',
  required: false,
  style: 'form',
  schema: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
}) tags: string[], @param({
  name: 'limit',
  in: 'query',
  description: 'maximum number of results to return',
  required: false,
  schema: {
    type: 'integer',
    format: 'int32',
  },
}) limit: number, @param({
  name: 'where',
  in: 'query',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        'title"': 'TodoList.WhereFilter',
        additionalProperties: true,
      },
    },
  },
}) where: {
  [additionalProperty: string]: any;
}): Promise<Pet[]> {
    throw new Error('Not implemented');
  }

  /**
   * Creates a new pet in the store. Duplicates are allowed
   *
   * @param _requestBody Pet to add to the store
   * @returns pet response
   */
  @operation('post', '/pets', {
  description: 'Creates a new pet in the store.  Duplicates are allowed',
  operationId: 'addPet',
  requestBody: {
    description: 'Pet to add to the store',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/NewPet',
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'pet response',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Pet',
          },
        },
      },
    },
    default: {
      description: 'unexpected error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  },
})
  async addPet(@requestBody({
  description: 'Pet to add to the store',
  required: true,
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/NewPet',
      },
    },
  },
}) _requestBody: NewPet): Promise<Pet> {
    throw new Error('Not implemented');
  }

  /**
   * Returns a user based on a single ID, if the user does not have access to the
pet
   *
   * @param id ID of pet to fetch
   * @returns pet response
   */
  @operation('get', '/pets/{id}', {
  description: 'Returns a user based on a single ID, if the user does not have access to the pet',
  operationId: 'find pet by id',
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'ID of pet to fetch',
      required: true,
      schema: {
        type: 'integer',
        format: 'int64',
      },
    },
  ],
  responses: {
    '200': {
      description: 'pet response',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Pet',
          },
        },
      },
    },
    default: {
      description: 'unexpected error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  },
})
  async findPetById(@param({
  name: 'id',
  in: 'path',
  description: 'ID of pet to fetch',
  required: true,
  schema: {
    type: 'integer',
    format: 'int64',
  },
}) id: number): Promise<Pet> {
    throw new Error('Not implemented');
  }

  /**
   * deletes a single pet based on the ID supplied
   *
   * @param id ID of pet to delete
   */
  @operation('delete', '/pets/{id}', {
  description: 'deletes a single pet based on the ID supplied',
  operationId: 'deletePet',
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'ID of pet to delete',
      required: true,
      schema: {
        type: 'integer',
        format: 'int64',
      },
    },
  ],
  responses: {
    '204': {
      description: 'pet deleted',
    },
    default: {
      description: 'unexpected error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  },
})
  async deletePet(@param({
  name: 'id',
  in: 'path',
  description: 'ID of pet to delete',
  required: true,
  schema: {
    type: 'integer',
    format: 'int64',
  },
}) id: number): Promise<any> {
    throw new Error('Not implemented');
  }

}


`;


exports[`openapi-generator with --client does not generates files for client with --no-client 3`] = `
export * from './pet.model';
export * from './new-pet.model';
export * from './error.model';

`;


exports[`openapi-generator with --client does not generates files for client with --no-client 4`] = `
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


exports[`openapi-generator with --client does not generates files for client with --no-client 5`] = `
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
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  name: string;

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  tag?: string;

}

export interface NewPetRelations {
  // describe navigational properties here
}

export type NewPetWithRelations = NewPet & NewPetRelations;



`;


exports[`openapi-generator with --client does not generates files for client with --no-client 6`] = `
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
  @property({required: true, jsonSchema: {
  type: 'integer',
  format: 'int32',
}})
  code: number;

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  message: string;

}

export interface ErrorRelations {
  // describe navigational properties here
}

export type ErrorWithRelations = Error & ErrorRelations;



`;


exports[`openapi-generator with --client does not generates files for server with --no-server 1`] = `
export * from './pet-store.datasource';

`;


exports[`openapi-generator with --client does not generates files for server with --no-server 2`] = `
import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise,
} from '@loopback/core';
import {juggler} from '@loopback/repository';
import config from './pet-store.datasource.config.json';

@lifeCycleObserver('datasource')
export class PetStoreDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'petStore';

  constructor(
    @inject('datasources.config.petStore', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}


`;


exports[`openapi-generator with --client does not generates files for server with --no-server 3`] = `
export * from './open-api.service';

`;


exports[`openapi-generator with --client does not generates files for server with --no-server 4`] = `
import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {PetStoreDataSource} from '../datasources';

import {Pet} from '../models/pet.model';
import {NewPet} from '../models/new-pet.model';

/**
 * The service interface is generated from OpenAPI spec with operations tagged
 * by <no-tag>.
 */
export interface OpenApiService {
  /**
   * Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem
sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio
lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar
ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst.
Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante
molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor
eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget
eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac
sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non
augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed
lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu
condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus.
In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus
nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus
ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean
nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque
mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero
lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa
ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium,
pulvinar elit eu, euismod sapien.

   * @param tags tags to filter by
   * @param limit maximum number of results to return
   * @param where 
   * @returns pet response
   */
  findPets(tags: string[], limit: number, where: {
  [additionalProperty: string]: any;
}): Promise<Pet[]>;

  /**
   * Creates a new pet in the store. Duplicates are allowed
   * @param _requestBody Pet to add to the store
   * @returns pet response
   */
  addPet(_requestBody: NewPet): Promise<Pet>;

  /**
   * Returns a user based on a single ID, if the user does not have access to the
pet
   * @param id ID of pet to fetch
   * @returns pet response
   */
  findPetById(id: number): Promise<Pet>;

  /**
   * deletes a single pet based on the ID supplied
   * @param id ID of pet to delete
   */
  deletePet(id: number): Promise<any>;

}

export class OpenApiServiceProvider implements Provider<OpenApiService> {
  constructor(
    // petStore must match the name property in the datasource json file
    @inject('datasources.petStore')
    protected dataSource: PetStoreDataSource = new PetStoreDataSource(),
  ) {}

  async value(): Promise<OpenApiService> {
    const service = await getService<{apis: {default: OpenApiService}}>(
      this.dataSource,
    );
    return service.apis['default'];
  }
}

`;


exports[`openapi-generator with --client does not generates files for server with --no-server 5`] = `
export * from './pet.model';
export * from './new-pet.model';
export * from './error.model';

`;


exports[`openapi-generator with --client does not generates files for server with --no-server 6`] = `
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


exports[`openapi-generator with --client does not generates files for server with --no-server 7`] = `
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
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  name: string;

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  tag?: string;

}

export interface NewPetRelations {
  // describe navigational properties here
}

export type NewPetWithRelations = NewPet & NewPetRelations;



`;


exports[`openapi-generator with --client does not generates files for server with --no-server 8`] = `
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
  @property({required: true, jsonSchema: {
  type: 'integer',
  format: 'int32',
}})
  code: number;

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  message: string;

}

export interface ErrorRelations {
  // describe navigational properties here
}

export type ErrorWithRelations = Error & ErrorRelations;



`;


exports[`openapi-generator with --client generates all files for both server and client 1`] = `
export * from './open-api.controller';

`;


exports[`openapi-generator with --client generates all files for both server and client 2`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
import {api, operation, param, requestBody} from '@loopback/rest';
import {Pet} from '../models/pet.model';
import {NewPet} from '../models/new-pet.model';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by <no-tag>.
 *
 */
@api({
  components: {
    schemas: {
      Pet: {
        allOf: [
          {
            $ref: '#/components/schemas/NewPet',
          },
          {
            required: [
              'id',
            ],
            properties: {
              id: {
                type: 'integer',
                format: 'int64',
              },
            },
          },
        ],
      },
      NewPet: {
        required: [
          'name',
        ],
        properties: {
          name: {
            type: 'string',
          },
          tag: {
            type: 'string',
          },
        },
      },
      Error: {
        required: [
          'code',
          'message',
        ],
        properties: {
          code: {
            type: 'integer',
            format: 'int32',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
  paths: {},
})
export class OpenApiController {
  constructor() {}

  /**
   * Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem
sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio
lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar
ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst.
Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante
molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor
eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget
eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac
sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non
augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed
lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu
condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus.
In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus
nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus
ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean
nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque
mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero
lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa
ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium,
pulvinar elit eu, euismod sapien.

   *
   * @param tags tags to filter by
   * @param limit maximum number of results to return
   * @param where 
   * @returns pet response
   */
  @operation('get', '/pets', {
  description: 'Returns all pets from the system that the user has access to\\nNam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.\\n\\nSed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.\\n',
  operationId: 'findPets',
  parameters: [
    {
      name: 'tags',
      in: 'query',
      description: 'tags to filter by',
      required: false,
      style: 'form',
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    {
      name: 'limit',
      in: 'query',
      description: 'maximum number of results to return',
      required: false,
      schema: {
        type: 'integer',
        format: 'int32',
      },
    },
    {
      name: 'where',
      in: 'query',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            'title"': 'TodoList.WhereFilter',
            additionalProperties: true,
          },
        },
      },
    },
  ],
  responses: {
    '200': {
      description: 'pet response',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Pet',
            },
          },
        },
      },
    },
    default: {
      description: 'unexpected error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  },
})
  async findPets(@param({
  name: 'tags',
  in: 'query',
  description: 'tags to filter by',
  required: false,
  style: 'form',
  schema: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
}) tags: string[], @param({
  name: 'limit',
  in: 'query',
  description: 'maximum number of results to return',
  required: false,
  schema: {
    type: 'integer',
    format: 'int32',
  },
}) limit: number, @param({
  name: 'where',
  in: 'query',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        'title"': 'TodoList.WhereFilter',
        additionalProperties: true,
      },
    },
  },
}) where: {
  [additionalProperty: string]: any;
}): Promise<Pet[]> {
    throw new Error('Not implemented');
  }

  /**
   * Creates a new pet in the store. Duplicates are allowed
   *
   * @param _requestBody Pet to add to the store
   * @returns pet response
   */
  @operation('post', '/pets', {
  description: 'Creates a new pet in the store.  Duplicates are allowed',
  operationId: 'addPet',
  requestBody: {
    description: 'Pet to add to the store',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/NewPet',
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'pet response',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Pet',
          },
        },
      },
    },
    default: {
      description: 'unexpected error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  },
})
  async addPet(@requestBody({
  description: 'Pet to add to the store',
  required: true,
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/NewPet',
      },
    },
  },
}) _requestBody: NewPet): Promise<Pet> {
    throw new Error('Not implemented');
  }

  /**
   * Returns a user based on a single ID, if the user does not have access to the
pet
   *
   * @param id ID of pet to fetch
   * @returns pet response
   */
  @operation('get', '/pets/{id}', {
  description: 'Returns a user based on a single ID, if the user does not have access to the pet',
  operationId: 'find pet by id',
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'ID of pet to fetch',
      required: true,
      schema: {
        type: 'integer',
        format: 'int64',
      },
    },
  ],
  responses: {
    '200': {
      description: 'pet response',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Pet',
          },
        },
      },
    },
    default: {
      description: 'unexpected error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  },
})
  async findPetById(@param({
  name: 'id',
  in: 'path',
  description: 'ID of pet to fetch',
  required: true,
  schema: {
    type: 'integer',
    format: 'int64',
  },
}) id: number): Promise<Pet> {
    throw new Error('Not implemented');
  }

  /**
   * deletes a single pet based on the ID supplied
   *
   * @param id ID of pet to delete
   */
  @operation('delete', '/pets/{id}', {
  description: 'deletes a single pet based on the ID supplied',
  operationId: 'deletePet',
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'ID of pet to delete',
      required: true,
      schema: {
        type: 'integer',
        format: 'int64',
      },
    },
  ],
  responses: {
    '204': {
      description: 'pet deleted',
    },
    default: {
      description: 'unexpected error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  },
})
  async deletePet(@param({
  name: 'id',
  in: 'path',
  description: 'ID of pet to delete',
  required: true,
  schema: {
    type: 'integer',
    format: 'int64',
  },
}) id: number): Promise<any> {
    throw new Error('Not implemented');
  }

}


`;


exports[`openapi-generator with --client generates all files for both server and client 3`] = `
export * from './pet-store.datasource';

`;


exports[`openapi-generator with --client generates all files for both server and client 4`] = `
import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise,
} from '@loopback/core';
import {juggler} from '@loopback/repository';
import config from './pet-store.datasource.config.json';

@lifeCycleObserver('datasource')
export class PetStoreDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'petStore';

  constructor(
    @inject('datasources.config.petStore', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}


`;


exports[`openapi-generator with --client generates all files for both server and client 5`] = `
export * from './open-api.service';

`;


exports[`openapi-generator with --client generates all files for both server and client 6`] = `
import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {PetStoreDataSource} from '../datasources';

import {Pet} from '../models/pet.model';
import {NewPet} from '../models/new-pet.model';

/**
 * The service interface is generated from OpenAPI spec with operations tagged
 * by <no-tag>.
 */
export interface OpenApiService {
  /**
   * Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem
sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio
lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar
ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst.
Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante
molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor
eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget
eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac
sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non
augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed
lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu
condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus.
In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus
nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus
ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean
nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque
mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero
lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa
ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium,
pulvinar elit eu, euismod sapien.

   * @param tags tags to filter by
   * @param limit maximum number of results to return
   * @param where 
   * @returns pet response
   */
  findPets(tags: string[], limit: number, where: {
  [additionalProperty: string]: any;
}): Promise<Pet[]>;

  /**
   * Creates a new pet in the store. Duplicates are allowed
   * @param _requestBody Pet to add to the store
   * @returns pet response
   */
  addPet(_requestBody: NewPet): Promise<Pet>;

  /**
   * Returns a user based on a single ID, if the user does not have access to the
pet
   * @param id ID of pet to fetch
   * @returns pet response
   */
  findPetById(id: number): Promise<Pet>;

  /**
   * deletes a single pet based on the ID supplied
   * @param id ID of pet to delete
   */
  deletePet(id: number): Promise<any>;

}

export class OpenApiServiceProvider implements Provider<OpenApiService> {
  constructor(
    // petStore must match the name property in the datasource json file
    @inject('datasources.petStore')
    protected dataSource: PetStoreDataSource = new PetStoreDataSource(),
  ) {}

  async value(): Promise<OpenApiService> {
    const service = await getService<{apis: {default: OpenApiService}}>(
      this.dataSource,
    );
    return service.apis['default'];
  }
}

`;


exports[`openapi-generator with --client generates all files for both server and client 7`] = `
export * from './pet.model';
export * from './new-pet.model';
export * from './error.model';

`;


exports[`openapi-generator with --client generates all files for both server and client 8`] = `
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


exports[`openapi-generator with --client generates all files for both server and client 9`] = `
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
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  name: string;

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  tag?: string;

}

export interface NewPetRelations {
  // describe navigational properties here
}

export type NewPetWithRelations = NewPet & NewPetRelations;



`;


exports[`openapi-generator with --client generates all files for both server and client 10`] = `
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
  @property({required: true, jsonSchema: {
  type: 'integer',
  format: 'int32',
}})
  code: number;

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  message: string;

}

export interface ErrorRelations {
  // describe navigational properties here
}

export type ErrorWithRelations = Error & ErrorRelations;



`;
