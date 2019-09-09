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
  settings: {
    strict: false,
    forceId: false,
    replaceOnPUT: true,
    validateUpsert: true,
    idInjection: true
  }
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
