# @loopback/metadata

This module contains utilities to help developers implement
[TypeScript decorators](https://www.typescriptlang.org/docs/handbook/decorators.html),
define/merge metadata, and inspect metadata.

- Reflector: Wrapper of
  [reflect-metadata](https://github.com/rbuckton/reflect-metadata)
- Decorator factories: A set of factories for class/method/property/parameter
  decorators to apply metadata to a given class and its static or instance
  members.
- MetadataInspector: High level APIs to inspect a class and/or its members to
  get metadata applied by decorators.

## Basic Use

### To create a class decorator

```ts
import {ClassDecoratorFactory} from '@loopback/metadata';

export interface MyClassMetadata {
  name: string;
  description?: string;
}

function myClassDecorator(spec: MyClassMetadata): ClassDecorator {
  return ClassDecoratorFactory.createDecorator<MyClassMetadata>(
    'metadata-key-for-my-class-decorator',
    spec,
    {decoratorName: '@myClassDecorator'},
  );
}
```

Alternatively, we can instantiate the factory and create a decorator:

```ts
function myClassDecorator(spec: MyClassMetadata): ClassDecorator {
  const factory = new ClassDecoratorFactory<MyClassMetadata>(
    'metadata-key-for-my-class-decorator',
    spec,
  );
  return factory.create();
}
```

Now we can use `@myClassDecorator` to add metadata to a class as follows:

```ts
@myClassDecorator({name: 'my-controller'})
class MyController {}
```

### To create a method decorator

```ts
import {MethodDecoratorFactory} from '@loopback/metadata';

export interface MyMethodMetadata {
  name: string;
  description?: string;
}

function myMethodDecorator(spec: MyMethodMetadata): MethodDecorator {
  return MethodDecoratorFactory.createDecorator<MyMethodMetadata>(
    'metadata-key-for-my-method-decorator',
    spec,
  );
}
```

Now we can use `@myMethodDecorator` to add metadata to a method as follows:

```ts
class MyController {
  @myMethodDecorator({name: 'my-method'})
  myMethod(x: string): string {
    return 'Hello, ' + x;
  }

  @myMethodDecorator({name: 'another-method'})
  anotherMethod() {}

  @myMethodDecorator({name: 'my-static-method'})
  static myStaticMethod() {}
}
```

### To create a property decorator

```ts
import {PropertyDecoratorFactory} from '@loopback/metadata';

export interface MyPropertyMetadata {
  name: string;
  description?: string;
}

function myPropertyDecorator(spec: MyPropertyMetadata): PropertyDecorator {
  return PropertyDecoratorFactory.createDecorator<MyPropertyMetadata>(
    'metadata-key-for-my-property-decorator',
    spec,
  );
}
```

Now we can use `@myPropertyDecorator` to add metadata to a property as follows:

```ts
class MyController {
  @myPropertyDecorator({name: 'my-property'})
  myProperty: string;

  @myPropertyDecorator({name: 'another-property'})
  anotherProperty: boolean;

  @myPropertyDecorator({name: 'my-static-property'})
  static myStaticProperty: string;
}
```

### To create a parameter decorator

```ts
import {ParameterDecoratorFactory} from '@loopback/metadata';

export interface MyParameterMetadata {
  name: string;
  description?: string;
}

function myParameterDecorator(spec: MyParameterMetadata): ParameterDecorator {
  return ParameterDecoratorFactory.createDecorator<MyParameterMetadata>(
    'metadata-key-for-my-parameter-decorator',
    spec,
  );
}
```

Now we can use `@myParameterDecorator` to add metadata to a parameter as
follows:

```ts
class MyController {
  constructor(
    @myParameterDecorator({name: 'logging-prefix'}) public prefix: string,
    @myParameterDecorator({name: 'logging-level'}) public level: number,
  ) {}

  myMethod(
    @myParameterDecorator({name: 'x'}) x: number,
    @myParameterDecorator({name: 'y'}) y: number,
  ) {}

  static myStaticMethod(
    @myParameterDecorator({name: 'a'}) a: string,
    @myParameterDecorator({name: 'b'}) b: string,
  ) {}
}
```

### To create method decorator for parameters

```ts
import {MethodParameterDecoratorFactory} from '@loopback/metadata';

export interface MyParameterMetadata {
  name: string;
  description?: string;
}

function myMethodParameterDecorator(
  spec: MyParameterMetadata,
): MethodDecorator {
  return MethodParameterDecoratorFactory.createDecorator<MyParameterMetadata>(
    'metadata-key-for-my-method-parameter-decorator',
    spec,
  );
}
```

Now we can use `@myMethodParameterDecorator` to add metadata to a parameter as
follows:

```ts
class MyController {
  @myMethodParameterDecorator({name: 'x'})
  @myMethodParameterDecorator({name: 'y'})
  myMethod(x: number, y: number) {}
}
```

**WARNING**: Using method decorators to provide metadata for parameters is
strongly discouraged for a few reasons:

1.  Method decorators cannot be applied to a constructor
2.  Method decorators depends on the positions to match parameters

We recommend that `ParameterDecorator` be used instead.

### Decorator options

An object of type `DecoratorOptions` can be passed in to create decorator
functions. There are two flags for the options:

- allowInheritance: Controls if inherited metadata will be honored. Default to
  `true`.
- cloneInputSpec: Controls if the value of `spec` argument will be cloned.
  Sometimes we use shared spec for the decoration, but the decorator function
  might need to mutate the object. Cloning the input spec makes it safe to use
  the same spec (`template`) to decorate different members. Default to `true`.
- decoratorName: Name for the decorator such as `@inject` for error and
  debugging messages.

### Customize inheritance of metadata

By default, the decorator factories allow inheritance with the following rules:

1.  If the metadata is an object, we merge the `spec` argument from the
    decorator function into the inherited value from base classes. For metadata
    of array and other primitive types, the `spec` argument is used if provided.

    - We can override `inherit` method of the decorator factory to customize how
      to resolve `spec` against the inherited metadata. For example:

```ts
protected inherit(inheritedMetadata: T | undefined | null): T {
  // Ignore the inherited metadata
  return this.spec;
}
```

2.  Method/property/parameter level metadata is applied to the class or its
    prototype as a map keyed method/property names. We think this approach is
    better than keeping metadata at method/property level as it's not easy to
    inspect a class to find static/instance methods and properties with
    decorations. The metadata for a class is illustrated below:

    - MyClass (the constructor function itself)

```ts
{
  // Class level metadata
  'my-class-decorator-key': MyClassMetadata,
  // Static method (including the constructor) parameter metadata
  'my-static-parameter-decorator-key': {
    '': [MyConstructorParameterMetadata], // Constructor parameter metadata
    'myStaticMethod1': [MyStaticMethodParameterMetadata],
    'myStaticMethod2': [MyStaticMethodParameterMetadata],
  },
  // Static method metadata
  'my-static-method-decorator-key': {
    'myStaticMethod1': MyStaticMethodMetadata,
    'myStaticMethod2': MyStaticMethodMetadata,
  },
  // Static property metadata
  'my-static-property-decorator-key': {
    'myStaticMethod1': MyStaticPropertyMetadata,
    'myStaticMethod1': MyStaticPropertyMetadata,
  }
}
```

- MyClass.prototype

```ts
{
  // Instance method parameter metadata
  'my-instance-parameter-decorator-key': {
    'myMethod1': [MyMethodParameterMetadata],
    'myMethod2': [MyMethodParameterMetadata],
  },
  // Instance method metadata
  'my-instance-method-decorator-key': {
    'myMethod1': MyMethodMetadata,
    'myMethod2': MyMethodMetadata,
  },
  // Instance property metadata
  'my-instance-property-decorator-key': {
    'myProperty1': MyPropertyMetadata,
    'myProperty2': MyPropertyMetadata,
  }
}
```

The following methods in `DecoratorFactory` allow subclasses to customize how to
merge the `spec` with existing metadata for a class, methods, properties, and
method parameters. Please note `M` is a map for methods/properties/parameters.

```ts
protected mergeWithInherited(
  inheritedMetadata: M,
  target: Object,
  member?: string,
  descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
): M {
  // ...
}

protected mergeWithOwn(
  ownMetadata: M,
  target: Object,
  member?: string,
  descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
): M {
  // ...
}
```

3.  The default implementation throws errors if the same decorator function is
    applied to a given target member (class/method/property/parameter) more than
    once. For example, the following usage will report an error at runtime.

```ts
@myClassDecorator({name: 'my-controller'})
@myClassDecorator({name: 'your-controller'})
class MyController {}
```

### Inspect metadata

`MetadataInspector` provides API to inspect metadata from a class and its
members.

### Inspect metadata of a class

```ts
import {MetadataInspector} from '@loopback/metadata';

const meta = MetadataInspector.getClassMetadata(
  'my-class-decorator-key',
  MyController,
);
```

### Inspect own metadata of a class

```ts
import {MetadataInspector} from '@loopback/metadata';

const meta = MetadataInspector.getClassMetadata<MyClassMetaData>(
  'my-class-decorator-key',
  MyController,
  {
    ownMetadataOnly: true,
  },
);
```

### Inspect metadata of a method

```ts
import {MetadataInspector} from '@loopback/metadata';

const allMethods = MetadataInspector.getAllMethodMetaData<MyMethodMetadata>(
  'my-method-decorator-key',
  MyController.prototype, // Use MyController for static methods
);

const myMethod = MetadataInspector.getMethodMetaData<MyMethodMetadata>(
  'my-method-decorator-key',
  MyController.prototype, // Use MyController for static methods
  'myMethod',
);
```

### Inspect metadata of a property

```ts
import {MetadataInspector} from '@loopback/metadata';

const allProps = MetadataInspector.getAllPropertyMetaData<MyPropertyMetadata>(
  'my-property-decorator-key',
  MyController.prototype, // Use MyController for static properties
);

const myProp = MetadataInspector.getMethodMetaData<MyMethodMetadata>(
  'my-property-decorator-key',
  MyController.prototype, // Use MyController for static properties
  'myProp',
);
```

### Inspect metadata of method parameters

```ts
import {MetadataInspector} from '@loopback/metadata';

const allParamsForMyMethod = MetadataInspector.getAllParameterMetaData<
  MyParameterMetadata
>(
  'my-parameter-decorator-key',
  MyController.prototype, // Use MyController for static methods,
  'myMethod',
);

const firstParamForMyMethod = MetadataInspector.getMyParameterMetaData<
  MyParameterMetadata
>(
  'my-parameter-decorator-key',
  MyController.prototype, // Use MyController for static methods
  'myMethod',
  0, // parameter index
);

const allParamsForConstructor = MetadataInspector.getAllParameterMetaData<
  MyParameterMetadata
>('my-parameter-decorator-key', MyController, '');
```

### Use strong-typed metadata access key

You can use MetadataAccessor to provide type checks for metadata access via
keys. For example,

```ts
const CLASS_KEY = MetadataAccessor.create<MyClassMetadata, ClassDecorator>(
  'my-class-decorator-key',
);

// Create a class decorator with the key
const myClassDecorator = ClassDecoratorFactory.createDecorator(CLASS_KEY);

// Inspect a class with the key
const myClassMeta = MetadataInspector.getClassMetaData(CLASS_KEY, MyController);
```

Please note MetadataKey can be an instance of MetadataAccessor or a string.

### Inspect design-time metadata of properties/methods

```ts
import {MetadataInspector} from '@loopback/metadata';

const myPropType = MetadataInspector.getDesignTypeForProperty(
  MyController.prototype,
  'myProp',
);

const myConstructor = MetadataInspector.getDesignTypeForMethod(
  MyController,
  '',
);

const myMethod = MetadataInspector.getDesignTypeForMethod(
  MyController.prototype, // Use MyController for static methods
  'myMethod',
);
```

## Installation

```sh
npm install --save @loopback/metadata
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
