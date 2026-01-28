// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingScope,
  Context,
  ContextTags,
  injectable,
  Provider,
} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  asService,
  CoreTags,
  createServiceBinding,
  filterByServiceInterface,
  service,
} from '../..';

describe('Service', () => {
  let ctx: Context;

  beforeEach(() => {
    ctx = new Context('test-context');
  });

  describe('@service decorator', () => {
    it('injects a service by class', async () => {
      @injectable({scope: BindingScope.SINGLETON})
      class MyService {
        getValue() {
          return 'my-value';
        }
      }

      class MyController {
        constructor(
          @service(MyService)
          public myService: MyService,
        ) {}
      }

      ctx
        .bind('services.MyService')
        .toClass(MyService)
        .apply(asService(MyService));
      ctx.bind('controllers.MyController').toClass(MyController);

      const controller = await ctx.get<MyController>(
        'controllers.MyController',
      );
      expect(controller.myService).to.be.instanceOf(MyService);
      expect(controller.myService.getValue()).to.equal('my-value');
    });

    it('injects a service by string interface', async () => {
      interface Calculator {
        add(a: number, b: number): number;
      }

      @injectable({scope: BindingScope.SINGLETON})
      class CalculatorService implements Calculator {
        add(a: number, b: number) {
          return a + b;
        }
      }

      class MyController {
        constructor(
          @service('Calculator')
          public calculator: Calculator,
        ) {}
      }

      ctx
        .bind('services.Calculator')
        .toClass(CalculatorService)
        .apply(asService('Calculator'));
      ctx.bind('controllers.MyController').toClass(MyController);

      const controller = await ctx.get<MyController>(
        'controllers.MyController',
      );
      expect(controller.calculator.add(2, 3)).to.equal(5);
    });

    it('injects a service by symbol interface', async () => {
      const CalculatorInterface = Symbol('Calculator');

      interface Calculator {
        add(a: number, b: number): number;
      }

      @injectable({scope: BindingScope.SINGLETON})
      class CalculatorService implements Calculator {
        add(a: number, b: number) {
          return a + b;
        }
      }

      class MyController {
        constructor(
          @service(CalculatorInterface)
          public calculator: Calculator,
        ) {}
      }

      ctx
        .bind('services.Calculator')
        .toClass(CalculatorService)
        .apply(asService(CalculatorInterface));
      ctx.bind('controllers.MyController').toClass(MyController);

      const controller = await ctx.get<MyController>(
        'controllers.MyController',
      );
      expect(controller.calculator.add(2, 3)).to.equal(5);
    });

    it('infers service type from design metadata', async () => {
      @injectable({scope: BindingScope.SINGLETON})
      class MyService {
        getValue() {
          return 'inferred';
        }
      }

      class MyController {
        constructor(
          @service()
          public myService: MyService,
        ) {}
      }

      ctx
        .bind('services.MyService')
        .toClass(MyService)
        .apply(asService(MyService));
      ctx.bind('controllers.MyController').toClass(MyController);

      const controller = await ctx.get<MyController>(
        'controllers.MyController',
      );
      expect(controller.myService.getValue()).to.equal('inferred');
    });

    it('throws error when service is not found', async () => {
      @injectable()
      class MyService {}

      class MyController {
        constructor(
          @service(MyService)
          public myService: MyService,
        ) {}
      }

      ctx.bind('controllers.MyController').toClass(MyController);

      await expect(
        ctx.get<MyController>('controllers.MyController'),
      ).to.be.rejectedWith(/No binding found for MyService/);
    });

    it('returns undefined for optional service when not found', async () => {
      @injectable()
      class MyService {}

      class MyController {
        constructor(
          @service(MyService, {optional: true})
          public myService?: MyService,
        ) {}
      }

      ctx.bind('controllers.MyController').toClass(MyController);

      const controller = await ctx.get<MyController>(
        'controllers.MyController',
      );
      expect(controller.myService).to.be.undefined();
    });

    it('throws error when multiple services match', async () => {
      @injectable({scope: BindingScope.SINGLETON})
      class MyService {
        getValue() {
          return 'value';
        }
      }

      class MyController {
        constructor(
          @service(MyService)
          public myService: MyService,
        ) {}
      }

      ctx
        .bind('services.MyService1')
        .toClass(MyService)
        .apply(asService(MyService));
      ctx
        .bind('services.MyService2')
        .toClass(MyService)
        .apply(asService(MyService));
      ctx.bind('controllers.MyController').toClass(MyController);

      await expect(
        ctx.get<MyController>('controllers.MyController'),
      ).to.be.rejectedWith(/More than one bindings found for MyService/);
    });

    it('throws error when design type cannot be inferred', async () => {
      class MyController {
        constructor(
          @service()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          public myService: any,
        ) {}
      }

      ctx.bind('controllers.MyController').toClass(MyController);

      await expect(
        ctx.get<MyController>('controllers.MyController'),
      ).to.be.rejectedWith(/Service class cannot be inferred from design type/);
    });

    it('throws error when design type is Object', async () => {
      class MyController {
        constructor(
          @service()
          public myService: object,
        ) {}
      }

      ctx.bind('controllers.MyController').toClass(MyController);

      await expect(
        ctx.get<MyController>('controllers.MyController'),
      ).to.be.rejectedWith(/Service class cannot be inferred from design type/);
    });

    it('throws error when design type is Array', async () => {
      class MyController {
        constructor(
          @service()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          public myService: any[],
        ) {}
      }

      ctx.bind('controllers.MyController').toClass(MyController);

      await expect(
        ctx.get<MyController>('controllers.MyController'),
      ).to.be.rejectedWith(/Service class cannot be inferred from design type/);
    });

    it('works with property injection', async () => {
      @injectable({scope: BindingScope.SINGLETON})
      class MyService {
        getValue() {
          return 'property-injected';
        }
      }

      class MyController {
        @service(MyService)
        public myService: MyService;
      }

      ctx
        .bind('services.MyService')
        .toClass(MyService)
        .apply(asService(MyService));
      ctx.bind('controllers.MyController').toClass(MyController);

      const controller = await ctx.get<MyController>(
        'controllers.MyController',
      );
      expect(controller.myService.getValue()).to.equal('property-injected');
    });
  });

  describe('filterByServiceInterface', () => {
    it('filters by string interface', () => {
      @injectable()
      class MyService {}

      const binding1 = Binding.bind('service1')
        .toClass(MyService)
        .apply(asService('MyServiceInterface'));
      const binding2 = Binding.bind('service2')
        .toClass(MyService)
        .apply(asService('OtherInterface'));

      const filter = filterByServiceInterface('MyServiceInterface');

      expect(filter(binding1)).to.be.true();
      expect(filter(binding2)).to.be.false();
    });

    it('filters by symbol interface', () => {
      const MyServiceInterface = Symbol('MyService');
      const OtherInterface = Symbol('Other');

      @injectable()
      class MyService {}

      const binding1 = Binding.bind('service1')
        .toClass(MyService)
        .apply(asService(MyServiceInterface));
      const binding2 = Binding.bind('service2')
        .toClass(MyService)
        .apply(asService(OtherInterface));

      const filter = filterByServiceInterface(MyServiceInterface);

      expect(filter(binding1)).to.be.true();
      expect(filter(binding2)).to.be.false();
    });

    it('matches by valueConstructor', () => {
      @injectable()
      class MyService {}

      const binding = Binding.bind('service1').toClass(MyService);

      const filter = filterByServiceInterface(MyService);

      expect(filter(binding)).to.be.true();
    });

    it('returns false for non-matching bindings', () => {
      @injectable()
      class MyService {}

      @injectable()
      class OtherService {}

      const binding = Binding.bind('service1')
        .toClass(OtherService)
        .apply(asService(OtherService));

      const filter = filterByServiceInterface(MyService);

      expect(filter(binding)).to.be.false();
    });
  });

  describe('createServiceBinding', () => {
    it('creates a service binding from a class', () => {
      @injectable({scope: BindingScope.SINGLETON})
      class MyService {
        getValue() {
          return 'value';
        }
      }

      const binding = createServiceBinding(MyService);

      expect(binding).to.be.instanceOf(Binding);
      expect(binding.tagMap[ContextTags.TYPE]).to.equal(CoreTags.SERVICE);
      expect(binding.tagMap[CoreTags.SERVICE_INTERFACE]).to.equal(MyService);
    });

    it('creates a service binding with custom name', () => {
      @injectable()
      class MyService {}

      const binding = createServiceBinding(MyService, {name: 'custom-service'});

      expect(binding.key).to.equal('services.custom-service');
    });

    it('creates a service binding with custom interface', () => {
      @injectable()
      class MyService {}

      const binding = createServiceBinding(MyService, {
        interface: 'CustomInterface',
      });

      expect(binding.tagMap[CoreTags.SERVICE_INTERFACE]).to.equal(
        'CustomInterface',
      );
    });

    it('creates a service binding from a provider', () => {
      @injectable()
      class MyServiceProvider implements Provider<string> {
        value() {
          return 'provided-value';
        }
      }

      const binding = createServiceBinding(MyServiceProvider);

      expect(binding).to.be.instanceOf(Binding);
      expect(binding.tagMap[CoreTags.SERVICE_INTERFACE]).to.equal(
        MyServiceProvider,
      );
    });

    it('trims Provider suffix from provider class name', () => {
      @injectable()
      class MyServiceProvider implements Provider<string> {
        value() {
          return 'value';
        }
      }

      const binding = createServiceBinding(MyServiceProvider);

      expect(binding.key).to.match(/MyService$/);
    });

    it('preserves name when not ending with Provider', () => {
      @injectable()
      class MyService implements Provider<string> {
        value() {
          return 'value';
        }
      }

      const binding = createServiceBinding(MyService);

      expect(binding.key).to.match(/MyService$/);
    });

    it('uses custom name over trimmed provider name', () => {
      @injectable()
      class MyServiceProvider implements Provider<string> {
        value() {
          return 'value';
        }
      }

      const binding = createServiceBinding(MyServiceProvider, {
        name: 'custom-name',
      });

      expect(binding.key).to.equal('services.custom-name');
    });

    it('creates binding with default options', () => {
      @injectable()
      class MyService {}

      const binding = createServiceBinding(MyService);

      expect(binding.tagMap[ContextTags.TYPE]).to.equal(CoreTags.SERVICE);
    });

    it('creates binding with custom namespace', () => {
      @injectable()
      class MyService {}

      const binding = createServiceBinding(MyService, {
        namespace: 'custom-services',
      });

      expect(binding.key).to.match(/^custom-services\./);
    });

    it('preserves binding metadata from class', () => {
      @injectable({scope: BindingScope.SINGLETON, tags: ['custom-tag']})
      class MyService {}

      const binding = createServiceBinding(MyService);

      expect(binding.scope).to.equal(BindingScope.SINGLETON);
      expect(Array.from(binding.tagNames)).to.containEql('custom-tag');
    });
  });

  describe('asService', () => {
    it('creates a binding template for service interface', () => {
      @injectable()
      class MyService {}

      const template = asService(MyService);
      const binding = Binding.bind('my.service').toClass(MyService);

      template(binding);

      expect(binding.tagMap[ContextTags.TYPE]).to.equal(CoreTags.SERVICE);
      expect(binding.tagMap[CoreTags.SERVICE_INTERFACE]).to.equal(MyService);
    });

    it('works with string interface', () => {
      @injectable()
      class MyService {}

      const template = asService('MyServiceInterface');
      const binding = Binding.bind('my.service').toClass(MyService);

      template(binding);

      expect(binding.tagMap[CoreTags.SERVICE_INTERFACE]).to.equal(
        'MyServiceInterface',
      );
    });

    it('works with symbol interface', () => {
      const MyServiceInterface = Symbol('MyService');

      @injectable()
      class MyService {}

      const template = asService(MyServiceInterface);
      const binding = Binding.bind('my.service').toClass(MyService);

      template(binding);

      expect(binding.tagMap[CoreTags.SERVICE_INTERFACE]).to.equal(
        MyServiceInterface,
      );
    });

    it('can be used with binding.apply()', () => {
      @injectable()
      class MyService {}

      const binding = Binding.bind('my.service')
        .toClass(MyService)
        .apply(asService(MyService));

      expect(binding.tagMap[CoreTags.SERVICE_INTERFACE]).to.equal(MyService);
    });

    it('preserves existing tags', () => {
      @injectable()
      class MyService {}

      const binding = Binding.bind('my.service')
        .toClass(MyService)
        .tag('custom-tag')
        .apply(asService(MyService));

      expect(Array.from(binding.tagNames)).to.containEql('custom-tag');
      expect(binding.tagMap[CoreTags.SERVICE_INTERFACE]).to.equal(MyService);
    });
  });

  describe('Integration scenarios', () => {
    it('service with dependencies', async () => {
      @injectable({scope: BindingScope.SINGLETON})
      class DatabaseService {
        query() {
          return ['data1', 'data2'];
        }
      }

      @injectable({scope: BindingScope.SINGLETON})
      class UserService {
        constructor(
          @service(DatabaseService)
          private db: DatabaseService,
        ) {}

        getUsers() {
          return this.db.query();
        }
      }

      class UserController {
        constructor(
          @service(UserService)
          public userService: UserService,
        ) {}
      }

      ctx
        .bind('services.DatabaseService')
        .toClass(DatabaseService)
        .apply(asService(DatabaseService));
      ctx
        .bind('services.UserService')
        .toClass(UserService)
        .apply(asService(UserService));
      ctx.bind('controllers.UserController').toClass(UserController);

      const controller = await ctx.get<UserController>(
        'controllers.UserController',
      );
      expect(controller.userService.getUsers()).to.eql(['data1', 'data2']);
    });

    it('service provider with value method', async () => {
      interface Config {
        apiKey: string;
      }

      @injectable()
      class ConfigProvider implements Provider<Config> {
        value() {
          return {apiKey: 'secret-key'};
        }
      }

      class MyController {
        constructor(
          @service('Config')
          public config: Config,
        ) {}
      }

      ctx
        .bind('services.Config')
        .toProvider(ConfigProvider)
        .apply(asService('Config'));
      ctx.bind('controllers.MyController').toClass(MyController);

      const controller = await ctx.get<MyController>(
        'controllers.MyController',
      );
      expect(controller.config.apiKey).to.equal('secret-key');
    });

    it('multiple services with same interface', async () => {
      interface Logger {
        log(message: string): void;
      }

      @injectable()
      class ConsoleLogger implements Logger {
        log(message: string) {
          // console.log(message);
        }
      }

      @injectable()
      class FileLogger implements Logger {
        log(message: string) {
          // write to file
        }
      }

      ctx
        .bind('services.ConsoleLogger')
        .toClass(ConsoleLogger)
        .apply(asService(ConsoleLogger));
      ctx
        .bind('services.FileLogger')
        .toClass(FileLogger)
        .apply(asService(FileLogger));

      const consoleLogger = await ctx.get<Logger>('services.ConsoleLogger');
      const fileLogger = await ctx.get<Logger>('services.FileLogger');

      expect(consoleLogger).to.be.instanceOf(ConsoleLogger);
      expect(fileLogger).to.be.instanceOf(FileLogger);
    });
  });
});

// Made with Bob
