import {Type} from './type';

/**
 * Array type, such as string[]
 */
export class ArrayType<T> implements Type<Array<T>> {
  constructor(public itemType: Type<T>) {
  }

  readonly name = 'array';

  isInstance(value: any) {
    if (!Array.isArray(value)) {
      return false;
    }
    let list = value as Array<T>;
    return list.every((i) => this.itemType.isInstance(i));
  }

  isCoercible(value: any): boolean {
    if (!Array.isArray(value)) {
      return false;
    }
    return value.every((i) => this.itemType.isCoercible(i));
  }

  defaultValue() {
    return [];
  }

  coerce(value: any) {
    return value;
  }

  serialize(value: Array<T>) {
    return value.map((i) => this.itemType.serialize(i));
  }
}
