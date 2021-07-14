// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 import-lb3-models imports CoffeeShop model from lb3-example app 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {strict: false, forceId: false, validateUpsert: true, idInjection: true}
})
export class CoffeeShop extends Entity {
  @property({
    type: 'number',
    id: 1,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  city?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<CoffeeShop>) {
    super(data);
  }
}

export interface CoffeeShopRelations {
  // describe navigational properties here
}

export type CoffeeShopWithRelations = CoffeeShop & CoffeeShopRelations;

`;


exports[`lb4 import-lb3-models imports CoffeeShop model from lb3-example app 2`] = `
export * from './coffee-shop.model';

`;


exports[`lb4 import-lb3-models imports a model inheriting from a custom base class 1`] = `
import {model, property} from '@loopback/repository';
import {UserBase} from '.';

@model({settings: {strict: false, customCustomerSetting: true}})
export class Customer extends UserBase {
  @property({
    type: 'boolean',
  })
  isPreferred?: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
}

export type CustomerWithRelations = Customer & CustomerRelations;

`;


exports[`lb4 import-lb3-models imports a model inheriting from a custom base class 2`] = `
import {model, property} from '@loopback/repository';
import {User} from '.';

@model({settings: {strict: false, customUserBaseSetting: true}})
export class UserBase extends User {
  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  isAccountVerified: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserBase>) {
    super(data);
  }
}

export interface UserBaseRelations {
  // describe navigational properties here
}

export type UserBaseWithRelations = UserBase & UserBaseRelations;

`;


exports[`lb4 import-lb3-models imports a model inheriting from a custom base class 3`] = `
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    strict: false,
    caseSensitiveEmail: true,
    hidden: ['password', 'verificationToken'],
    maxTTL: 31556926,
    ttl: 1209600
  }
})
export class User extends Entity {
  @property({
    type: 'number',
    id: 1,
    generated: true,
    updateOnly: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  realm?: string;

  @property({
    type: 'string',
  })
  username?: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'boolean',
  })
  emailVerified?: boolean;

  @property({
    type: 'string',
  })
  verificationToken?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;

`;
