interface ReturnType {
  name: string;
  value?: string;
}

// tslint:disable:no-any
export type Constructor<T> = new (...args: any[]) => T;

export function Mix<T extends object, U extends object>(
  superclass: U & Constructor<T> = class {} as U & Constructor<T>,
) {
  return new MixinBuilder<T, U>(superclass);
}

export type Properties<T> = {[K in keyof T]: T[K]};

// A signature that works: define mixin as a class not function
export class MixinBuilder<T extends object, U extends object> {
  private superclass: Constructor<T> & U;
  constructor(superclass: Constructor<T> & U) {
    this.superclass = superclass;
  }

  with<M1 extends object, I1 extends object>(
    m1: Properties<M1> & Constructor<I1>,
    ...mixins: Function[]
  ): M1 & U & Constructor<T & I1>;

  with<MAll>(...mixins: Function[]): Constructor<T> {
    return mixins.reduce(
      (c, mixin) => mixin(c),
      this.superclass,
    ) as Constructor<T>;
  }
}

class Person {
  methodA() {
    console.log('methodA');
    return this;
  }
  static methodS(): ReturnType[] {
    return [{name: 'foo'}, {name: 'bar'}];
  }
  methodI(): ReturnType[] {
    return [{name: 'foo'}, {name: 'bar'}];
  }
}
class Named {
  static mixinmethodS(): ReturnType[] {
    return [{name: 'foo'}, {name: 'bar'}];
  }
  mixinmethodI(): ReturnType[] {
    return [{name: 'foo'}, {name: 'bar'}];
  }
}
class Programmer {}
class Random {}
class Cody extends Mix(Person).with(Named, Programmer, Random) {}

Cody.mixinmethodS().map(b => b.name);
Cody.mixinmethodS().map(b => b.name);
new Cody().mixinmethodI().map(b => b.name);
Cody.methodS().map(b => b);
new Cody().methodI().map(b => b);
