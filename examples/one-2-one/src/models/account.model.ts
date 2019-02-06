import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Supplier} from './supplier.model';

@model({settings: {strict: false}})
export class Account extends Entity {
  @property({
    type: 'string',
    id: true,
    description: 'Account ID',
    required: true,
  })
  id: string;

  @property({
    type: 'string',
  })
  accountManager?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // [prop: string]: any;

  @belongsTo(() => Supplier)
  supplierId: string;

  constructor(data?: Partial<Account>) {
    super(data);
  }
}
