import {model, property, hasMany, Entity} from '../../..';
import {Order} from './order.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @hasMany(() => Order)
  orders: Order[];
}
