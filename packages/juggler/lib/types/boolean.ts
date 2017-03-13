import {Type} from './type';

/**
 * Boolean type
 */
export class BooleanType implements Type<boolean> {
  readonly name = 'boolean';

  isInstance(value: any) {
    return value == null || typeof value === 'boolean';
  }

  defaultValue() {
    return false;
  }

  isCoercible(value: any): boolean {
    return true;
  }

  coerce(value: any) {
    return value == null ? value : Boolean(value);
  }

  serialize(value: boolean) {
    return value;
  }
}
