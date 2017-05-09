import {ValueObject} from "../../src/model";

export class Address extends ValueObject {
  street: string;
  city: string;
  zipCode: string;
  state: string
}