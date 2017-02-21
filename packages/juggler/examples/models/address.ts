import {ValueObject} from "../../lib/model";

export class Address extends ValueObject {
  street: string;
  city: string;
  zipCode: string;
  state: string
}