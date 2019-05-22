# Context in action

In the traditional modular design, we often declare various artifacts as
classes/interfaces in separate files and use `export/import` to reference from
each other across modules.

For a large-scale application or framework, many kinds of artifacts and many
instances of the same kind are added to the project. In many cases, there are
also dependencies among them. It is desirable to have a consistent way to manage
such artifacts so that they can be registered, configured, accessed, and
resolved while respecting the dependency requirements.

[Inversion of Control (IoC)](https://en.wikipedia.org/wiki/Inversion_of_control)
is a proven design pattern to solve similar problems. Together with
[Dependency Injection (DI)](https://en.wikipedia.org/wiki/Dependency_injection),
artifacts become much more tangible and visible.

In LoopBack 4, we implemented such capabilities in the `@loopback/context`
module. The hierarchy of contexts become the universal knowledge base for the
whole application to promote visibility, extensibility, and composability.

Let's walk through some code snippets to illustrate how artifacts are managed
with `@loopback/context`.

## Registering artifacts

To register artifacts, we first create an instance of `Context` and use `bind`
to add artifacts to the registry as bindings.

```ts
import {Context} from '@loopback/context';
import {GreetingController} from './controllers';
import {CACHING_SERVICE, GREETING_SERVICE} from './keys';
import {CachingService} from './caching-service';
import {GreetingService} from './greeting-service';

const ctx = new Context();
ctx.bind('controllers.GreetingController').toClass(GreetingController);
ctx.bind(CACHING_SERVICE).toClass(CachingService);
ctx.bind(GREETING_SERVICE).toClass(GreetingService);
```

```ts
export class GreetingApplication extends BootMixin(RestApplication) {
  constructor(config: ApplicationConfig = {}) {
    super(config);
    this.projectRoot = __dirname;
    this.add(createBindingFromClass(CachingService, {key: CACHING_SERVICE}));
    this.add(createBindingFromClass(CachingInterceptor));
    this.component(GreetingComponent);
  }
  // ...
}
```

## Providing values for artifacts

https://github.com/strongloop/loopback-next/blob/master/examples/context/src/binding-types.ts

1. As a constant value

2. To be created by a factory function

3. To be instantiated from a class

4. To be created from a provider class

5. As an alias to another binding

## Resolving artifacts by key

https://github.com/strongloop/loopback-next/blob/master/examples/context/src/find-bindings.ts

## Discovering artifacts by filter

## Binding scopes

1. Transient
2. Singleton
3. Context

## Watching artifacts

https://github.com/strongloop/loopback-next/blob/master/examples/context/src/context-observation.ts

## Contributing multiple artifacts via components

https://github.com/strongloop/loopback-next/blob/master/examples/greeter-extension/src/component.ts

```ts
/**
 * Define a component to register the greeter extension point and built-in
 * extensions
 */
export class GreetingComponent implements Component {
  bindings = [
    createBindingFromClass(GreetingService, {
      key: GREETING_SERVICE,
    }),
    createBindingFromClass(EnglishGreeter),
    createBindingFromClass(ChineseGreeter),
  ];
}
```

https://github.com/strongloop/loopback-next/tree/master/examples/context
