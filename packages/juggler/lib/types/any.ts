import {Type} from './type';

/**
 * Any type
 */
export class AnyType implements Type<any> {
  readonly name = 'any';

  isInstance(value: any) {
    return true;
  }

  isCoercible(value: any) {
    return true;
  }

  defaultValue() {
    return undefined;
  }

  coerce(value: any) {
    return value;
  }

  serialize(value: any) {
    return value;
  }
}