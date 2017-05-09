import {Entity} from "../../src/model";
import {property, model, belongsTo} from "../../src/decorator";
import {Customer} from './customer'

@model()
class Order extends Entity {
  @property({name: 'qty', mysql: {
    column: 'QTY'
  }})
  quantity: number;

  @property({name: 'id', id: true, generated: true})
  id: string;
  customerId: string;

  @belongsTo()
  customer: Customer;
}
