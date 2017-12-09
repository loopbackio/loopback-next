// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Reflector,
  ClassDecoratorFactory,
  PropertyDecoratorFactory,
  MethodDecoratorFactory,
  ParameterDecoratorFactory,
  DecoratorFactory,
} from '../..';

describe('ClassDecoratorFactory', () => {
  /**
   * Define `@classDecorator(spec)`
   * @param spec
   */
  function classDecorator(spec: object): ClassDecorator {
    return ClassDecoratorFactory.createDecorator('test', spec);
  }

  @classDecorator({x: 1})
  class BaseController {}

  @classDecorator({y: 2})
  class SubController extends BaseController {}

  it('applies metadata to a class', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql({x: 1});
    expect(meta[DecoratorFactory.TARGET]).to.equal(BaseController);
  });

  it('merges with base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta).to.eql({x: 1, y: 2});
    expect(meta[DecoratorFactory.TARGET]).to.equal(SubController);
  });

  it('does not mutate base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql({x: 1});
    expect(meta[DecoratorFactory.TARGET]).to.equal(BaseController);
  });

  it('throws if applied more than once on the target', () => {
    expect(() => {
      @classDecorator({x: 1})
      @classDecorator({y: 2})
      // tslint:disable-next-line:no-unused-variable
      class MyController {}
    }).to.throw(
      /Decorator cannot be applied more than once on class MyController/,
    );
  });
});

describe('ClassDecoratorFactory with create', () => {
  interface MySpec {
    x?: number;
    y?: number;
  }

  /**
   * Define `@classDecorator(spec)`
   * @param spec
   */
  function classDecorator(spec: MySpec): ClassDecorator {
    const factory = new ClassDecoratorFactory<MySpec>('test', spec);
    return factory.create();
  }

  @classDecorator({x: 1})
  class BaseController {}

  @classDecorator({y: 2})
  class SubController extends BaseController {}

  it('applies metadata to a class', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql({x: 1});
  });

  it('merges with base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta).to.eql({x: 1, y: 2});
  });

  it('does not mutate base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql({x: 1});
  });
});

describe('ClassDecoratorFactory without inheritance', () => {
  /**
   * Define `@classDecorator(spec)`
   * @param spec
   */
  function classDecorator(spec: object): ClassDecorator {
    return ClassDecoratorFactory.createDecorator('test', spec, {
      allowInheritance: false,
    });
  }

  @classDecorator({x: 1})
  class BaseController {}

  @classDecorator({y: 2})
  class SubController extends BaseController {}

  it('applies metadata to a class', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql({x: 1});
  });

  it('merges with base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta).to.eql({y: 2});
  });

  it('does not mutate base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql({x: 1});
  });
});

describe('ClassDecoratorFactory does not inherit array values', () => {
  /**
   * Define `@classDecorator(spec)`
   * @param spec
   */
  function classDecorator(spec: object): ClassDecorator {
    return ClassDecoratorFactory.createDecorator('test', spec);
  }

  @classDecorator([1])
  class BaseController {}

  @classDecorator([2])
  class SubController extends BaseController {}

  it('applies metadata to a class', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql([1]);
  });

  it('merges with base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta).to.eql([2]);
  });

  it('does not mutate base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql([1]);
  });
});

describe('ClassDecoratorFactory with custom inherit', () => {
  /**
   * Define `@classDecorator(spec)`
   * @param spec
   */
  function classDecorator(spec: object): ClassDecorator {
    class MyClassDecoratorFactory extends ClassDecoratorFactory<object> {
      /**
       * Override the `inherit` method to skip metadata from the base
       * @param baseMeta
       */
      inherit(baseMeta: object) {
        return this.spec;
      }
    }
    return MyClassDecoratorFactory.createDecorator('test', spec);
  }

  @classDecorator({x: 1})
  class BaseController {}

  @classDecorator({y: 2})
  class SubController extends BaseController {}

  it('applies metadata to a class', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql({x: 1});
  });

  it('merges with base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta).to.eql({y: 2});
  });

  it('does not mutate base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql({x: 1});
  });
});

describe('PropertyDecoratorFactory', () => {
  /**
   * Define `@propertyDecorator(spec)`
   * @param spec
   */
  function propertyDecorator(spec: object): PropertyDecorator {
    return PropertyDecoratorFactory.createDecorator('test', spec);
  }

  class BaseController {
    @propertyDecorator({x: 1})
    myProp: string;
  }

  class SubController extends BaseController {
    @propertyDecorator({y: 2})
    myProp: string;
  }

  it('applies metadata to a property', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController.prototype);
    expect(meta.myProp).to.eql({x: 1});
  });

  it('merges with base property metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController.prototype);
    expect(meta.myProp).to.eql({x: 1, y: 2});
  });

  it('does not mutate base property metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController.prototype);
    expect(meta.myProp).to.eql({x: 1});
  });

  it('throws if applied more than once on the same property', () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-variable
      class MyController {
        @propertyDecorator({x: 1})
        @propertyDecorator({y: 2})
        myProp: string;
      }
    }).to.throw(
      /Decorator cannot be applied more than once on property MyController\.prototype\.myProp/,
    );
  });
});

describe('PropertyDecoratorFactory for static properties', () => {
  /**
   * Define `@propertyDecorator(spec)`
   * @param spec
   */
  function propertyDecorator(spec: object): PropertyDecorator {
    return PropertyDecoratorFactory.createDecorator('test', spec);
  }

  class BaseController {
    @propertyDecorator({x: 1})
    static myProp: string;
  }

  class SubController extends BaseController {
    @propertyDecorator({y: 2})
    static myProp: string;
  }

  it('applies metadata to a property', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta.myProp).to.eql({x: 1});
  });

  it('merges with base property metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta.myProp).to.eql({x: 1, y: 2});
  });

  it('does not mutate base property metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta.myProp).to.eql({x: 1});
  });

  it('throws if applied more than once on the same static property', () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-variable
      class MyController {
        @propertyDecorator({x: 1})
        @propertyDecorator({y: 2})
        static myProp: string;
      }
    }).to.throw(
      /Decorator cannot be applied more than once on property MyController\.myProp/,
    );
  });
});

describe('MethodDecoratorFactory', () => {
  /**
   * Define `@methodDecorator(spec)`
   * @param spec
   */
  function methodDecorator(spec: object): MethodDecorator {
    return MethodDecoratorFactory.createDecorator('test', spec);
  }

  class BaseController {
    @methodDecorator({x: 1})
    myMethod() {}
  }

  class SubController extends BaseController {
    @methodDecorator({y: 2})
    myMethod() {}
  }

  it('applies metadata to a method', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController.prototype);
    expect(meta.myMethod).to.eql({x: 1});
  });

  it('merges with base method metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController.prototype);
    expect(meta.myMethod).to.eql({x: 1, y: 2});
  });

  it('does not mutate base method metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController.prototype);
    expect(meta.myMethod).to.eql({x: 1});
  });

  it('throws if applied more than once on the same method', () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-variable
      class MyController {
        @methodDecorator({x: 1})
        @methodDecorator({y: 2})
        myMethod() {}
      }
    }).to.throw(
      /Decorator cannot be applied more than once on method MyController\.prototype\.myMethod/,
    );
  });
});

describe('MethodDecoratorFactory for static methods', () => {
  /**
   * Define `@methodDecorator(spec)`
   * @param spec
   */
  function methodDecorator(spec: object): MethodDecorator {
    return MethodDecoratorFactory.createDecorator('test', spec);
  }

  class BaseController {
    @methodDecorator({x: 1})
    static myMethod() {}
  }

  class SubController extends BaseController {
    @methodDecorator({y: 2})
    static myMethod() {}
  }

  it('applies metadata to a method', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta.myMethod).to.eql({x: 1});
  });

  it('merges with base method metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta.myMethod).to.eql({x: 1, y: 2});
  });

  it('does not mutate base method metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta.myMethod).to.eql({x: 1});
  });

  it('throws if applied more than once on the same static method', () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-variable
      class MyController {
        @methodDecorator({x: 1})
        @methodDecorator({y: 2})
        static myMethod() {}
      }
    }).to.throw(
      /Decorator cannot be applied more than once on method MyController\.myMethod/,
    );
  });
});

describe('ParameterDecoratorFactory', () => {
  /**
   * Define `@parameterDecorator(spec)`
   * @param spec
   */
  function parameterDecorator(spec: object): ParameterDecorator {
    return ParameterDecoratorFactory.createDecorator('test', spec);
  }

  class BaseController {
    myMethod(
      @parameterDecorator({x: 1})
      a: string,
      b: number,
    ) {}
  }

  class SubController extends BaseController {
    myMethod(
      @parameterDecorator({y: 2})
      a: string,
      @parameterDecorator({x: 2})
      b: number,
    ) {}
  }

  it('applies metadata to a method parameter', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController.prototype);
    expect(meta.myMethod).to.eql([{x: 1}, undefined]);
  });

  it('merges with base method metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController.prototype);
    expect(meta.myMethod).to.eql([{x: 1, y: 2}, {x: 2}]);
  });

  it('does not mutate base method parameter metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController.prototype);
    expect(meta.myMethod).to.eql([{x: 1}, undefined]);
  });

  it('throws if applied more than once on the same parameter', () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-variable
      class MyController {
        myMethod(
          @parameterDecorator({x: 1})
          @parameterDecorator({y: 2})
          x: string,
        ) {}
      }
    }).to.throw(
      /Decorator cannot be applied more than once on parameter MyController\.prototype\.myMethod\[0\]/,
    );
  });
});

describe('ParameterDecoratorFactory for a constructor', () => {
  /**
   * Define `@parameterDecorator(spec)`
   * @param spec
   */
  function parameterDecorator(spec: object): ParameterDecorator {
    return ParameterDecoratorFactory.createDecorator('test', spec);
  }

  class BaseController {
    constructor(
      @parameterDecorator({x: 1})
      a: string,
      b: number,
    ) {}
  }

  class SubController extends BaseController {
    constructor(
      @parameterDecorator({y: 2})
      a: string,
      @parameterDecorator({x: 2})
      b: number,
    ) {
      super(a, b);
    }
  }

  it('applies metadata to a method parameter', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta['']).to.eql([{x: 1}, undefined]);
  });

  it('merges with base method metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta['']).to.eql([{x: 1, y: 2}, {x: 2}]);
  });

  it('does not mutate base method parameter metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta['']).to.eql([{x: 1}, undefined]);
  });
});

describe('ParameterDecoratorFactory for a static method', () => {
  /**
   * Define `@parameterDecorator(spec)`
   * @param spec
   */
  function parameterDecorator(spec: object): ParameterDecorator {
    return ParameterDecoratorFactory.createDecorator('test', spec);
  }

  class BaseController {
    static myMethod(
      @parameterDecorator({x: 1})
      a: string,
      b: number,
    ) {}
  }

  class SubController extends BaseController {
    static myMethod(
      @parameterDecorator({y: 2})
      a: string,
      @parameterDecorator({x: 2})
      b: number,
    ) {}
  }

  it('applies metadata to a method parameter', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta['myMethod']).to.eql([{x: 1}, undefined]);
  });

  it('merges with base method metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta['myMethod']).to.eql([{x: 1, y: 2}, {x: 2}]);
  });

  it('does not mutate base method parameter metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta['myMethod']).to.eql([{x: 1}, undefined]);
  });

  it('throws if applied more than once on the same parameter', () => {
    expect(() => {
      // tslint:disable-next-line:no-unused-variable
      class MyController {
        static myMethod(
          @parameterDecorator({x: 1})
          @parameterDecorator({y: 2})
          x: string,
        ) {}
      }
    }).to.throw(
      /Decorator cannot be applied more than once on parameter MyController\.myMethod\[0\]/,
    );
  });
});
