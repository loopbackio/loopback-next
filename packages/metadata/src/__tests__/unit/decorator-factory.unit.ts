// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  ClassDecoratorFactory,
  DecoratorFactory,
  MethodDecoratorFactory,
  MethodParameterDecoratorFactory,
  ParameterDecoratorFactory,
  PropertyDecoratorFactory,
  Reflector,
} from '../..';

describe('DecoratorFactory.cloneDeep', () => {
  it('keeps functions/classes', () => {
    class MyController {}
    const val = {
      target: MyController,
      fn: function() {},
      spec: {x: 1},
    };
    const copy = DecoratorFactory.cloneDeep(val);
    expect(copy.target).to.be.exactly(val.target);
    expect(copy.fn).to.be.exactly(val.fn);
    expect(copy.spec).to.not.exactly(val.spec);
    expect(copy).to.be.eql(val);
  });

  it('keeps class prototypes', () => {
    class MyController {}
    const val = {
      target: MyController.prototype,
      spec: {x: 1},
    };
    const copy = DecoratorFactory.cloneDeep(val);
    expect(copy.target).to.be.exactly(val.target);
    expect(copy.spec).to.not.exactly(val.spec);
    expect(copy).to.be.eql(val);
  });

  it('keeps user-defined class instances', () => {
    class MyController {
      constructor(public x: string) {}
    }
    const val = {
      target: new MyController('A'),
    };
    const copy = DecoratorFactory.cloneDeep(val);
    expect(copy.target).to.exactly(val.target);
  });

  it('clones dates', () => {
    const val = {
      d: new Date(),
    };
    const copy = DecoratorFactory.cloneDeep(val);
    expect(copy.d).to.not.exactly(val.d);
    expect(copy).to.be.eql(val);
  });

  it('clones regexp', () => {
    const val = {
      re: /Ab/,
    };
    const copy = DecoratorFactory.cloneDeep(val);
    expect(copy.re).to.not.exactly(val.re);
    expect(copy).to.be.eql(val);
  });
});

describe('ClassDecoratorFactory', () => {
  /**
   * Define `@classDecorator(spec)`
   * @param spec
   */
  function classDecorator(spec: object): ClassDecorator {
    return ClassDecoratorFactory.createDecorator('test', spec);
  }

  function testDecorator(spec: object): ClassDecorator {
    return ClassDecoratorFactory.createDecorator('test', spec, {
      decoratorName: '@test',
    });
  }

  const xSpec = {x: 1};
  @classDecorator(xSpec)
  class BaseController {}

  @classDecorator({y: 2})
  class SubController extends BaseController {}

  it('applies metadata to a class', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.eql(xSpec);
    // By default, the input spec is cloned
    expect(meta).to.not.exactly(xSpec);
    expect(meta[DecoratorFactory.TARGET]).to.equal(BaseController);
  });

  it('merges with base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta).to.eql({x: 1, y: 2});
    // The subclass spec should not the same instance as the input spec
    expect(meta).to.not.exactly(xSpec);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyController {}
    }).to.throw(
      /ClassDecorator cannot be applied more than once on class MyController/,
    );
  });

  it('throws with decoratorName if applied more than once on the target', () => {
    expect(() => {
      @testDecorator({x: 1})
      @testDecorator({y: 2})
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyController {}
    }).to.throw(/@test cannot be applied more than once on class MyController/);
  });
});

describe('ClassDecoratorFactory for primitive types', () => {
  /**
   * Define `@classDecorator(spec)`
   * @param spec
   */
  function classDecorator(spec: number): ClassDecorator {
    return ClassDecoratorFactory.createDecorator('test', spec);
  }

  const xSpec = 1;
  @classDecorator(xSpec)
  class BaseController {}

  @classDecorator(2)
  class SubController extends BaseController {}

  it('applies metadata to a class', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.equal(xSpec);
  });

  it('merges with base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController);
    expect(meta).to.equal(2);
  });

  it('does not mutate base class metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.equal(1);
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

describe('ClassDecoratorFactory with cloneInputSpec set to false', () => {
  /**
   * Define `@classDecorator(spec)`
   * @param spec
   */
  function classDecorator(spec: object): ClassDecorator {
    return ClassDecoratorFactory.createDecorator('test', spec, {
      cloneInputSpec: false,
    });
  }

  const mySpec = {x: 1};
  @classDecorator(mySpec)
  class BaseController {}

  it('clones input spec', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController);
    expect(meta).to.exactly(mySpec);
    expect(meta).to.eql(mySpec);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyController {
        @propertyDecorator({x: 1})
        @propertyDecorator({y: 2})
        myProp: string;
      }
    }).to.throw(
      /Decorator cannot be applied more than once on MyController\.prototype\.myProp/,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyController {
        @propertyDecorator({x: 1})
        @propertyDecorator({y: 2})
        static myProp: string;
      }
    }).to.throw(
      /Decorator cannot be applied more than once on MyController\.myProp/,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyController {
        @methodDecorator({x: 1})
        @methodDecorator({y: 2})
        myMethod() {}
      }
    }).to.throw(
      /Decorator cannot be applied more than once on MyController\.prototype\.myMethod\(\)/,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyController {
        @methodDecorator({x: 1})
        @methodDecorator({y: 2})
        static myMethod() {}
      }
    }).to.throw(
      /Decorator cannot be applied more than once on MyController\.myMethod\(\)/,
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
    myMethod(@parameterDecorator({x: 1}) a: string, b: number) {}
  }

  class SubController extends BaseController {
    myMethod(
      @parameterDecorator({y: 2}) a: string,
      @parameterDecorator({x: 2}) b: number,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyController {
        myMethod(
          @parameterDecorator({x: 1})
          @parameterDecorator({y: 2})
          x: string,
        ) {}
      }
    }).to.throw(
      /Decorator cannot be applied more than once on MyController\.prototype\.myMethod\[0\]/,
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
    constructor(@parameterDecorator({x: 1}) a: string, b: number) {}
  }

  class SubController extends BaseController {
    constructor(
      @parameterDecorator({y: 2}) a: string,
      @parameterDecorator({x: 2}) b: number,
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
    static myMethod(@parameterDecorator({x: 1}) a: string, b: number) {}
  }

  class SubController extends BaseController {
    static myMethod(
      @parameterDecorator({y: 2}) a: string,
      @parameterDecorator({x: 2}) b: number,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyController {
        static myMethod(
          @parameterDecorator({x: 1})
          @parameterDecorator({y: 2})
          x: string,
        ) {}
      }
    }).to.throw(
      /Decorator cannot be applied more than once on MyController\.myMethod\[0\]/,
    );
  });
});

describe('MethodParameterDecoratorFactory', () => {
  /**
   * Define `@parameterDecorator(spec)`
   * @param spec
   */
  function methodParameterDecorator(spec: object): MethodDecorator {
    return MethodParameterDecoratorFactory.createDecorator('test', spec);
  }

  class BaseController {
    @methodParameterDecorator({x: 1}) // Will be applied to b
    myMethod(a: string, b: number) {}
  }

  class SubController extends BaseController {
    @methodParameterDecorator({x: 2}) // For a
    @methodParameterDecorator({y: 2}) // For b
    myMethod(a: string, b: number) {}
  }

  it('applies metadata to a method parameter', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController.prototype);
    expect(meta.myMethod).to.eql([undefined, {x: 1}]);
  });

  it('merges with base method metadata', () => {
    const meta = Reflector.getOwnMetadata('test', SubController.prototype);
    expect(meta.myMethod).to.eql([{x: 2}, {x: 1, y: 2}]);
  });

  it('does not mutate base method parameter metadata', () => {
    const meta = Reflector.getOwnMetadata('test', BaseController.prototype);
    expect(meta.myMethod).to.eql([undefined, {x: 1}]);
  });
});

describe('MethodParameterDecoratorFactory with invalid decorations', () => {
  /**
   * Define `@parameterDecorator(spec)`
   * @param spec
   */
  function methodParameterDecorator(spec: object): MethodDecorator {
    return MethodParameterDecoratorFactory.createDecorator('test', spec, {
      decoratorName: '@param',
    });
  }

  it('reports error if the # of decorations exceeeds the # of params', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class MyController {
        @methodParameterDecorator({x: 1}) // Causing error
        @methodParameterDecorator({x: 2}) // For a
        @methodParameterDecorator({x: 3}) // For b
        myMethod(a: string, b: number) {}
      }
    }).to.throw(
      /@param is used more than 2 time\(s\) on MyController\.prototype\.myMethod\(\)/,
    );
  });
});
