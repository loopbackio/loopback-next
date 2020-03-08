// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingScope,
  BINDING_METADATA_KEY,
  Context,
  createBindingFromClass,
  Getter,
  MetadataInspector,
} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  addExtension,
  CoreTags,
  extensionFilter,
  extensionFor,
  extensionPoint,
  extensions,
} from '../..';

describe('extension point', () => {
  describe('@extensionPoint', () => {
    it('specifies name of the extension point as a binding tag', () => {
      @extensionPoint('greeters', {scope: BindingScope.SINGLETON})
      class GreetingService {
        @extensions()
        public greeters: Getter<Greeter[]>;
      }

      const bindingMetadata = MetadataInspector.getClassMetadata(
        BINDING_METADATA_KEY,
        GreetingService,
      );

      expect(bindingMetadata).to.not.undefined();
      expect(bindingMetadata!.templates).to.be.an.Array();

      const binding = createBindingFromClass(GreetingService);
      expect(binding.tagMap).to.containEql({
        [CoreTags.EXTENSION_POINT]: 'greeters',
      });
      expect(binding.scope).to.eql(BindingScope.SINGLETON);
    });
  });

  describe('@extensions', () => {
    let ctx: Context;

    beforeEach(givenContext);

    it('injects a getter function of extensions', async () => {
      @extensionPoint('greeters')
      class GreetingService {
        @extensions()
        public greeters: Getter<Greeter[]>;
      }

      // `@extensionPoint` is a sugar decorator for `@bind`
      const binding = createBindingFromClass(GreetingService, {
        key: 'greeter-service',
      });
      ctx.add(binding);
      registerGreeters('greeters');
      const greeterService = await ctx.get<GreetingService>('greeter-service');
      const greeters = await greeterService.greeters();
      assertGreeterExtensions(greeters);
    });

    it('injects extensions based on `name` tag of the extension point binding', async () => {
      class GreetingService {
        @extensions()
        public greeters: Getter<Greeter[]>;
      }
      ctx
        .bind('greeter-service')
        .toClass(GreetingService)
        .tag({name: 'greeters'}); // Tag the extension point with a name
      registerGreeters('greeters');
      const greeterService = await ctx.get<GreetingService>('greeter-service');
      const greeters = await greeterService.greeters();
      assertGreeterExtensions(greeters);
    });

    it('injects extensions based on class name of the extension point', async () => {
      class GreetingService {
        constructor(
          @extensions()
          public greeters: Getter<Greeter[]>,
        ) {}
      }
      ctx.bind('greeter-service').toClass(GreetingService);
      registerGreeters(GreetingService.name);
      const greeterService = await ctx.get<GreetingService>('greeter-service');
      const loadedGreeters = await greeterService.greeters();
      assertGreeterExtensions(loadedGreeters);
    });

    it('injects extensions based on class name of the extension point using property', async () => {
      class GreetingService {
        @extensions()
        public greeters: Getter<Greeter[]>;
      }
      ctx.bind('greeter-service').toClass(GreetingService);
      registerGreeters(GreetingService.name);
      const greeterService = await ctx.get<GreetingService>('greeter-service');
      const greeters = await greeterService.greeters();
      assertGreeterExtensions(greeters);
    });

    it('injects extensions based on extension point name from @extensions', async () => {
      class GreetingService {
        @extensions('greeters')
        public greeters: Getter<Greeter[]>;
      }
      ctx.bind('greeter-service').toClass(GreetingService);
      registerGreeters('greeters');
      const greeterService = await ctx.get<GreetingService>('greeter-service');
      const greeters = await greeterService.greeters();
      assertGreeterExtensions(greeters);
    });

    it('injects multiple types of extensions', async () => {
      interface Logger {
        log(message: string): void;
      }

      class ConsoleLogger implements Logger {
        log(message: string) {
          console.log(message);
        }
      }

      class GreetingService {
        constructor(
          @extensions('greeters')
          public greeters: Getter<Greeter[]>,
          @extensions('loggers')
          public loggers: Getter<Greeter[]>,
        ) {}
      }
      ctx.bind('greeter-service').toClass(GreetingService);
      registerGreeters('greeters');
      addExtension(ctx, 'loggers', ConsoleLogger);
      const greeterService = await ctx.get<GreetingService>('greeter-service');
      const loadedGreeters = await greeterService.greeters();
      assertGreeterExtensions(loadedGreeters);
      const loadedLoggers = await greeterService.loggers();
      expect(loadedLoggers).to.be.an.Array();
      expect(loadedLoggers.length).to.equal(1);
      expect(loadedLoggers[0]).to.be.instanceOf(ConsoleLogger);
    });

    it('allows an extension to contribute to multiple extension points', () => {
      @bind(extensionFor('extensionPoint-1'), extensionFor('extensionPoint-2'))
      class MyExtension {}
      const binding = createBindingFromClass(MyExtension);
      expect(binding.tagMap[CoreTags.EXTENSION_FOR]).to.eql([
        'extensionPoint-1',
        'extensionPoint-2',
      ]);
    });

    it('allows an extension of multiple extension points with extensionFor', () => {
      class MyExtension {}
      const binding = ctx.bind('my-extension').toClass(MyExtension);
      extensionFor('extensionPoint-1')(binding);
      expect(binding.tagMap[CoreTags.EXTENSION_FOR]).to.eql('extensionPoint-1');

      // Now we have two extension points
      extensionFor('extensionPoint-2')(binding);
      expect(binding.tagMap[CoreTags.EXTENSION_FOR]).to.eql([
        'extensionPoint-1',
        'extensionPoint-2',
      ]);

      // No duplication
      extensionFor('extensionPoint-1')(binding);
      expect(binding.tagMap[CoreTags.EXTENSION_FOR]).to.eql([
        'extensionPoint-1',
        'extensionPoint-2',
      ]);
    });

    it('allows multiple extension points for extensionFilter', () => {
      class MyExtension {}
      const binding = ctx.bind('my-extension').toClass(MyExtension);
      extensionFor('extensionPoint-1', 'extensionPoint-2')(binding);
      expect(extensionFilter('extensionPoint-1')(binding)).to.be.true();
      expect(extensionFilter('extensionPoint-2')(binding)).to.be.true();
      expect(extensionFilter('extensionPoint-3')(binding)).to.be.false();
    });

    it('allows multiple extension points for @extensions', async () => {
      @extensionPoint('extensionPoint-1')
      class MyExtensionPoint1 {
        @extensions() getMyExtensions: Getter<MyExtension[]>;
      }

      @extensionPoint('extensionPoint-2')
      class MyExtensionPoint2 {
        @extensions() getMyExtensions: Getter<MyExtension[]>;
      }

      @bind(extensionFor('extensionPoint-1', 'extensionPoint-2'))
      class MyExtension {}

      ctx.add(
        createBindingFromClass(MyExtensionPoint1, {key: 'extensionPoint1'}),
      );
      ctx.add(
        createBindingFromClass(MyExtensionPoint2, {key: 'extensionPoint2'}),
      );
      ctx.add(createBindingFromClass(MyExtension));
      const ep1: MyExtensionPoint1 = await ctx.get('extensionPoint1');
      const ep2: MyExtensionPoint2 = await ctx.get('extensionPoint2');
      const extensionsFor1 = await ep1.getMyExtensions();
      const extensionsFor2 = await ep2.getMyExtensions();
      expect(extensionsFor1.length).to.eql(1);
      expect(extensionsFor1[0]).to.be.instanceOf(MyExtension);
      expect(extensionsFor2.length).to.eql(1);
      expect(extensionsFor2[0]).to.be.instanceOf(MyExtension);
    });

    function givenContext() {
      ctx = new Context();
    }

    function registerGreeters(extensionPointName: string) {
      addExtension(ctx, extensionPointName, EnglishGreeter, {
        namespace: 'greeters',
      });
      addExtension(ctx, extensionPointName, ChineseGreeter, {
        namespace: 'greeters',
      });
    }
  });

  interface Greeter {
    language: string;
    greet(name: string): string;
  }

  class EnglishGreeter implements Greeter {
    language = 'en';
    greet(name: string) {
      return `Hello, ${name}!`;
    }
  }

  class ChineseGreeter implements Greeter {
    language = 'zh';
    greet(name: string) {
      return `你好，${name}！`;
    }
  }

  function assertGreeterExtensions(greeters: Greeter[]) {
    const languages = greeters.map(greeter => greeter.language).sort();
    expect(languages).to.eql(['en', 'zh']);
  }
});
