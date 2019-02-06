import {Entity, model, property, hasOne} from '@loopback/repository';
import {Account} from './account.model';

@model({settings: {strict: false}})
export class Supplier extends Entity {
  @property({
    type: 'string',
    id: true,
    description: 'Supplier ID',
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // [prop: string]: any;

  @hasOne(() => Account)
  accounts: Account;

  constructor(data?: Partial<Supplier>) {
    super(data);
  }
}
