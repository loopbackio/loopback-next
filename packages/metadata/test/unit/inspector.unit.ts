// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  ClassDecoratorFactory,
  PropertyDecoratorFactory,
  MethodDecoratorFactory,
  ParameterDecoratorFactory,
  MetadataInspector,
} from '../..';
import {MetadataAccessor} from '../..';

describe('Inspector for a class', () => {
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

  class AnotherController extends BaseController {}

  const TEST_META = MetadataAccessor.create<object, ClassDecorator>('test');

  it('inspects metadata of a base class', () => {
    const meta = MetadataInspector.getClassMetadata('test', BaseController);
    expect(meta).to.eql({x: 1});
  });

  it('inspects metadata of a sub class', () => {
    const meta = MetadataInspector.getClassMetadata(TEST_META, SubController);
    expect(meta).to.eql({x: 1, y: 2});
  });

  it('inspects metadata of a sub class without override', () => {
    const meta = MetadataInspector.getClassMetadata('test', AnotherController);
    expect(meta).to.eql({x: 1});
  });
});

describe('Inspector for a class for its own metadata', () => {
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

  class AnotherController extends BaseController {}

  it('inspects metadata of a base class', () => {
    const meta = MetadataInspector.getClassMetadata('test', BaseController, {
      ownMetadataOnly: true,
    });
    expect(meta).to.eql({x: 1});
  });

  it('inspects metadata of a sub class', () => {
    const meta = MetadataInspector.getClassMetadata('test', SubController, {
      ownMetadataOnly: true,
    });
    expect(meta).to.eql({x: 1, y: 2});
  });

  it('inspects metadata of a sub class without override', () => {
    const meta = MetadataInspector.getClassMetadata('test', AnotherController, {
      ownMetadataOnly: true,
    });
    expect(meta).to.be.undefined();
  });
});

describe('Inspector for instance properties', () => {
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

  class AnotherController extends BaseController {
    myProp: string;
  }

  const TEST_META = MetadataAccessor.create<object, PropertyDecorator>('test');

  it('inspects metadata of all properties of a base class', () => {
    const meta = MetadataInspector.getAllPropertyMetadata(
      'test',
      BaseController.prototype,
    );
    expect(meta).to.eql({myProp: {x: 1}});
  });

  it('inspects metadata of a property of a base class', () => {
    const meta = MetadataInspector.getPropertyMetadata(
      TEST_META,
      BaseController.prototype,
      'myProp',
    );
    expect(meta).to.eql({x: 1});
  });

  it('inspects metadata of all properties of a sub class', () => {
    const meta = MetadataInspector.getAllPropertyMetadata(
      'test',
      SubController.prototype,
    );
    expect(meta).to.eql({myProp: {x: 1, y: 2}});
  });

  it('inspects own metadata of all properties of a sub class', () => {
    const meta = MetadataInspector.getAllPropertyMetadata(
      'test',
      AnotherController.prototype,
      {ownMetadataOnly: true},
    );
    expect(meta).to.be.undefined();

    const propertyMeta = MetadataInspector.getPropertyMetadata(
      'test',
      AnotherController.prototype,
      'myProp',
      {ownMetadataOnly: true},
    );
    expect(propertyMeta).to.be.undefined();
  });
});

describe('Inspector for static properties', () => {
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

  class AnotherController extends BaseController {
    static myProp: string;
  }

  it('inspects metadata of all properties of a base class', () => {
    const meta = MetadataInspector.getAllPropertyMetadata(
      'test',
      BaseController,
    );
    expect(meta).to.eql({myProp: {x: 1}});
  });

  it('inspects metadata of a property of a base class', () => {
    const meta = MetadataInspector.getPropertyMetadata(
      'test',
      BaseController,
      'myProp',
    );
    expect(meta).to.eql({x: 1});
  });

  it('inspects metadata of all properties of a sub class', () => {
    const meta = MetadataInspector.getAllPropertyMetadata(
      'test',
      SubController,
    );
    expect(meta).to.eql({myProp: {x: 1, y: 2}});
  });

  it('inspects own metadata of all properties of a sub class', () => {
    const meta = MetadataInspector.getAllPropertyMetadata(
      'test',
      AnotherController,
      {ownMetadataOnly: true},
    );
    expect(meta).to.be.undefined();

    const propertyMeta = MetadataInspector.getPropertyMetadata(
      'test',
      AnotherController,
      'myProp',
      {ownMetadataOnly: true},
    );
    expect(propertyMeta).to.be.undefined();
  });
});

describe('Inspector for instance methods', () => {
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

  class AnotherController extends BaseController {}

  const TEST_META = MetadataAccessor.create<object, MethodDecorator>('test');

  it('inspects metadata of all methods of a base class', () => {
    const meta = MetadataInspector.getAllMethodMetadata(
      'test',
      BaseController.prototype,
    );
    expect(meta).to.eql({myMethod: {x: 1}});
  });

  it('inspects metadata of a method of a base class', () => {
    const meta = MetadataInspector.getMethodMetadata(
      TEST_META,
      BaseController.prototype,
      'myMethod',
    );
    expect(meta).to.eql({x: 1});
  });

  it('inspects metadata of all methods of a sub class', () => {
    const meta = MetadataInspector.getAllMethodMetadata(
      TEST_META,
      SubController.prototype,
    );
    expect(meta).to.eql({myMethod: {x: 1, y: 2}});
  });

  it('inspects own metadata of all methods of a sub class', () => {
    const meta = MetadataInspector.getAllMethodMetadata(
      'test',
      AnotherController.prototype,
      {ownMetadataOnly: true},
    );
    expect(meta).to.be.undefined();

    const methodMeta = MetadataInspector.getMethodMetadata(
      'test',
      AnotherController.prototype,
      'myMethod',
      {ownMetadataOnly: true},
    );
    expect(methodMeta).to.be.undefined();
  });
});

describe('Inspector for static methods', () => {
  /**
   * Define `@methodDecorator(spec)`
   * @param spec
   */
  function methodDecorator(spec: object): MethodDecorator {
    return PropertyDecoratorFactory.createDecorator('test', spec);
  }

  class BaseController {
    @methodDecorator({x: 1})
    static myMethod() {}
  }

  class SubController extends BaseController {
    @methodDecorator({y: 2})
    static myMethod() {}
  }

  class AnotherController extends BaseController {}

  it('inspects metadata of all methods of a base class', () => {
    const meta = MetadataInspector.getAllMethodMetadata('test', BaseController);
    expect(meta).to.eql({myMethod: {x: 1}});
  });

  it('inspects metadata of a property of a base class', () => {
    const meta = MetadataInspector.getMethodMetadata(
      'test',
      BaseController,
      'myMethod',
    );
    expect(meta).to.eql({x: 1});
  });

  it('inspects metadata of all properties of a sub class', () => {
    const meta = MetadataInspector.getAllMethodMetadata('test', SubController);
    expect(meta).to.eql({myMethod: {x: 1, y: 2}});
  });

  it('inspects own metadata of all methods of a sub class', () => {
    const meta = MetadataInspector.getAllMethodMetadata(
      'test',
      AnotherController,
      {ownMetadataOnly: true},
    );
    expect(meta).to.be.undefined();

    const methodMeta = MetadataInspector.getMethodMetadata(
      'test',
      AnotherController,
      'myMethod',
      {ownMetadataOnly: true},
    );
    expect(methodMeta).to.be.undefined();

    const inherited = MetadataInspector.getAllMethodMetadata(
      'test',
      AnotherController,
    );
    expect(inherited).to.eql({myMethod: {x: 1}});
  });
});

describe('Inspector for parameters of an instance method', () => {
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

  class AnotherController extends BaseController {}

  const TEST_META = MetadataAccessor.create<object, ParameterDecorator>('test');

  it('inspects metadata of all parameters of a method of the base class', () => {
    const meta = MetadataInspector.getAllParameterMetadata(
      TEST_META,
      BaseController.prototype,
      'myMethod',
    );
    expect(meta).to.eql([{x: 1}, undefined]);
  });

  it('inspects metadata of all parameters of a method of the sub class', () => {
    const meta = MetadataInspector.getAllParameterMetadata(
      'test',
      SubController.prototype,
      'myMethod',
    );
    expect(meta).to.eql([{x: 1, y: 2}, {x: 2}]);
  });

  it('inspects metadata of a parameter of a method of the sub class', () => {
    const meta = MetadataInspector.getParameterMetadata(
      TEST_META,
      SubController.prototype,
      'myMethod',
      0,
    );
    expect(meta).to.eql({x: 1, y: 2});
  });

  it('inspects own metadata of all method parameters of a sub class', () => {
    const meta = MetadataInspector.getAllParameterMetadata(
      'test',
      AnotherController.prototype,
      'myMethod',
      {ownMetadataOnly: true},
    );
    expect(meta).to.be.undefined();

    const paramsMeta = MetadataInspector.getParameterMetadata(
      'test',
      AnotherController.prototype,
      'myMethod',
      0,
      {ownMetadataOnly: true},
    );
    expect(paramsMeta).to.be.undefined();

    const inherited = MetadataInspector.getAllMethodMetadata(
      'test',
      AnotherController.prototype,
    );
    expect(inherited).to.eql({myMethod: [{x: 1}, undefined]});
  });
});

describe('Inspector for parameters of a static method', () => {
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

  class AnotherController extends BaseController {}

  it('inspects metadata of all parameters of a method of the base class', () => {
    const meta = MetadataInspector.getAllParameterMetadata(
      'test',
      BaseController,
      'myMethod',
    );
    expect(meta).to.eql([{x: 1}, undefined]);
  });

  it('inspects metadata of all parameters of a method of the sub class', () => {
    const meta = MetadataInspector.getAllParameterMetadata(
      'test',
      SubController,
      'myMethod',
    );
    expect(meta).to.eql([{x: 1, y: 2}, {x: 2}]);
  });

  it('inspects metadata of a parameter of a method of the sub class', () => {
    const meta = MetadataInspector.getParameterMetadata(
      'test',
      SubController,
      'myMethod',
      0,
    );
    expect(meta).to.eql({x: 1, y: 2});
  });

  it('inspects own metadata of all method parameters of a sub class', () => {
    const meta = MetadataInspector.getAllParameterMetadata(
      'test',
      AnotherController,
      'myMethod',
      {ownMetadataOnly: true},
    );
    expect(meta).to.be.undefined();

    const paramsMeta = MetadataInspector.getParameterMetadata(
      'test',
      AnotherController,
      'myMethod',
      0,
      {ownMetadataOnly: true},
    );
    expect(paramsMeta).to.be.undefined();

    const inherited = MetadataInspector.getAllMethodMetadata(
      'test',
      AnotherController,
    );
    expect(inherited).to.eql({myMethod: [{x: 1}, undefined]});
  });
});

describe('Inspector for parameters of a constructor', () => {
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

  it('inspects metadata of all parameters of the constructor of the base class', () => {
    const meta = MetadataInspector.getAllParameterMetadata(
      'test',
      BaseController,
    );
    expect(meta).to.eql([{x: 1}, undefined]);
  });

  it('inspects metadata of all parameters of the constructor of the sub class', () => {
    const meta = MetadataInspector.getAllParameterMetadata(
      'test',
      SubController,
      '',
    );
    expect(meta).to.eql([{x: 1, y: 2}, {x: 2}]);
  });

  it('inspects metadata of a parameter of the constructor of the sub class', () => {
    const meta = MetadataInspector.getParameterMetadata(
      'test',
      SubController,
      '',
      0,
    );
    expect(meta).to.eql({x: 1, y: 2});
  });
});

describe('Inspector for design time metadata', () => {
  function propertyDecorator(spec?: object): PropertyDecorator {
    return PropertyDecoratorFactory.createDecorator('test:properties', spec);
  }

  function methodDecorator(spec?: object): MethodDecorator {
    return MethodDecoratorFactory.createDecorator('test:methods', spec);
  }

  function parameterDecorator(spec?: object): ParameterDecorator {
    return ParameterDecoratorFactory.createDecorator('test:parameters', spec);
  }

  class MyClass {}

  class MyController {
    constructor(@parameterDecorator({x: 1}) a: string, b: number) {}

    @propertyDecorator()
    myProp: string;

    @propertyDecorator()
    myType: MyClass;

    @propertyDecorator()
    myArray: string[];

    @propertyDecorator()
    myUnionType: string | number;

    @methodDecorator()
    myMethod(x: string, y: number): boolean {
      return false;
    }

    @propertyDecorator()
    static myStaticProp = {};

    @methodDecorator()
    static myStaticMethod(x: string, y: number): boolean {
      return false;
    }
  }

  it('inspects design time type for properties with simple type', () => {
    const meta = MetadataInspector.getDesignTypeForProperty(
      MyController.prototype,
      'myProp',
    );
    expect(meta).to.eql(String);
  });

  it('inspects design time type for properties with array type', () => {
    const meta = MetadataInspector.getDesignTypeForProperty(
      MyController.prototype,
      'myArray',
    );
    // Unfortunately, we cannot access `string[]` as the item type of an array
    // is not emitted by TypeScript
    expect(meta).to.eql(Array);
  });

  it('inspects design time type for properties with class type', () => {
    const meta = MetadataInspector.getDesignTypeForProperty(
      MyController.prototype,
      'myType',
    );
    expect(meta).to.eql(MyClass);
  });

  it('inspects design time type for properties with union type', () => {
    const meta = MetadataInspector.getDesignTypeForProperty(
      MyController.prototype,
      'myUnionType',
    );
    // Union type is recorded as Object
    expect(meta).to.eql(Object);
  });

  it('inspects design time type for static properties', () => {
    const meta = MetadataInspector.getDesignTypeForProperty(
      MyController,
      'myStaticProp',
    );
    expect(meta).to.eql(Object);
  });

  it('inspects design time type for the constructor', () => {
    const meta = MetadataInspector.getDesignTypeForMethod(MyController, '');
    expect(meta).to.eql({
      type: undefined,
      returnType: undefined,
      parameterTypes: [String, Number],
    });
  });

  it('inspects design time type for instance methods', () => {
    const meta = MetadataInspector.getDesignTypeForMethod(
      MyController.prototype,
      'myMethod',
    );
    expect(meta).to.eql({
      type: Function,
      returnType: Boolean,
      parameterTypes: [String, Number],
    });
  });

  it('inspects design time type for static methods', () => {
    const meta = MetadataInspector.getDesignTypeForMethod(
      MyController,
      'myStaticMethod',
    );
    expect(meta).to.eql({
      type: Function,
      returnType: Boolean,
      parameterTypes: [String, Number],
    });
  });
});
