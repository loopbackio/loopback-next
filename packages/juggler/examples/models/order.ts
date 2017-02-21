import {Entity} from "../../lib/model";
import {property, model, belongsTo} from "../../lib/decorator";
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
