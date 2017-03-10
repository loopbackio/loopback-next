/**
 * Typing system for LoopBack
 */

export interface Type<T> {
  name: string;

  /**
   * Test if the given value is an instance of this type
   * @param value The value
   */
  isInstance(value: any): boolean;

  /**
   * Generate the default value for this type
   */
  defaultValue(): T;

  /**
   * Check if the given value can be coerced into this type
   * @param value
   * @returns {boolean}
   */
  isCoercible(value: any): boolean;

  /**
   * Coerce the value into this type
   * @param value The value to be coerced
   * @returns Coerced value of this type
   */
  coerce(value: any): T;

  /**
   * Serialize a value into json
   * @param value
   */
  serialize(value: T): any;
}


export class StringType implements Type<string> {
  readonly name = 'string';

  isInstance(value: any): boolean {
    return typeof value === 'string';
  }

  isCoercible(value: any): boolean {
    return true;
  }

  defaultValue(): string {
    return '';
  }

  coerce(value: any): string {
    return String(value);
  }

  serialize(value: string) {
    return value;
  }
}

export class BooleanType implements Type<boolean> {
  readonly name = 'boolean';

  isInstance(value: any) {
    return typeof value === 'boolean';
  }

  defaultValue() {
    return false;
  }

  isCoercible(value: any): boolean {
    return true;
  }

  coerce(value: any) {
    return Boolean(value);
  }

  serialize(value: boolean) {
    return value;
  }
}

export class NumberType implements Type<number> {
  readonly name = 'number';

  isInstance(value: any) {
    return typeof value === 'number';
  }

  isCoercible(value: any): boolean {
    return !isNaN(Number(value));
  }

  defaultValue() {
    return 0;
  }

  coerce(value: any) {
    return Number(value);
  }

  serialize(value: number) {
    return value;
  }
}

export class DateType implements Type<Date> {
  readonly name = 'date';

  isInstance(value: any) {
    return value instanceof Date;
  }

  isCoercible(value: any): boolean {
    return !isNaN(new Date(value).getTime());
  }

  defaultValue() {
    return new Date();
  }

  coerce(value: any) {
    return new Date(value);
  }

  serialize(value: Date) {
    return value.toJSON();
  }
}

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

export class UnionType implements Type<any> {
  constructor(public itemTypes: Type<any>[]) {
  }

  readonly name = 'union';

  isInstance(value: any) {
    return this.itemTypes.some((t) => t.isInstance(value));
  }

  isCoercible(value: any) {
    return this.itemTypes.some((t) => t.isCoercible(value));
  }

  defaultValue() {
    return this.itemTypes[0].defaultValue();
  }

  coerce(value: any) {
    for (let type of this.itemTypes) {
      if (type.isInstance(value)) {
        return type.serialize(value);
      }
    }
  }

  serialize(value: Type<any>) {
    for (let type of this.itemTypes) {
      if (type.isInstance(value)) {
        return type.serialize(value);
      }
    }
  }
}
