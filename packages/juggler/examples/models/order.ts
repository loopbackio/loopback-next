import {Entity} from "../../lib/model";
import {property, model} from "../../lib/decorator";

@model()
class Order extends Entity {
  @property({name: 'qty', mysql: {
    column: 'QTY'
  }})
  quantity: number;

  id: string;
  customerId: string;
}
