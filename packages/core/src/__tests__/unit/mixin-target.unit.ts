// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {MixinTarget} from '../..';

describe('MixinTarget', () => {
  describe('type definition', () => {
    it('allows mixin to extend a base class', () => {
      class BaseClass {
        public baseProp = 'base';
        public baseMethod() {
          return 'base-method';
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public mixinProp = 'mixin';
          public mixinMethod() {
            return 'mixin-method';
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      expect(instance.baseProp).to.equal('base');
      expect(instance.mixinProp).to.equal('mixin');
      expect(instance.baseMethod()).to.equal('base-method');
      expect(instance.mixinMethod()).to.equal('mixin-method');
    });

    it('allows accessing public properties from base class', () => {
      class BaseClass {
        public name = 'base';
        public getValue() {
          return this.name;
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public getNameFromBase() {
            return this.name;
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      expect(instance.getNameFromBase()).to.equal('base');
    });

    it('allows accessing public methods from base class', () => {
      class BaseClass {
        public calculate(a: number, b: number) {
          return a + b;
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public calculateDouble(a: number, b: number) {
            return this.calculate(a, b) * 2;
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      expect(instance.calculateDouble(2, 3)).to.equal(10);
    });

    it('supports multiple mixins', () => {
      class BaseClass {
        public base = 'base';
      }

      function mixin1<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public mixin1 = 'mixin1';
        };
      }

      function mixin2<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public mixin2 = 'mixin2';
        };
      }

      class Extended extends mixin2(mixin1(BaseClass)) {}

      const instance = new Extended();
      expect(instance.base).to.equal('base');
      expect(instance.mixin1).to.equal('mixin1');
      expect(instance.mixin2).to.equal('mixin2');
    });

    it('allows mixin to override base class methods', () => {
      class BaseClass {
        public getValue() {
          return 'base';
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          // @ts-expect-error - Override method from base class
          public getValue() {
            return 'mixin-override';
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      expect(instance.getValue()).to.equal('mixin-override');
    });

    it('allows mixin to call super methods', () => {
      class BaseClass {
        public getValue() {
          return 'base';
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          // @ts-expect-error - Override method from base class
          public getValue() {
            return super.getValue() + '-extended';
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      expect(instance.getValue()).to.equal('base-extended');
    });

    it('supports generic base classes', () => {
      class BaseClass<T> {
        constructor(public value: T) {}
        public getValue() {
          return this.value;
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass<unknown>>>(
        superClass: T,
      ) {
        return class extends superClass {
          public getValueTwice() {
            return [this.getValue(), this.getValue()];
          }
        };
      }

      class Extended extends MyMixin(BaseClass)<string> {}

      const instance = new Extended('test');
      expect(instance.getValueTwice()).to.eql(['test', 'test']);
    });

    it('allows mixin to add constructor parameters', () => {
      class BaseClass {
        constructor(public baseProp: string) {}
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public mixinProp: string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          constructor(...args: any[]) {
            super(...args);
            this.mixinProp = 'mixin';
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended('base-value');
      expect(instance.baseProp).to.equal('base-value');
      expect(instance.mixinProp).to.equal('mixin');
    });

    it('supports inheritance chain', () => {
      class GrandParent {
        public grandProp = 'grand';
      }

      class Parent extends GrandParent {
        public parentProp = 'parent';
      }

      function MyMixin<T extends MixinTarget<Parent>>(superClass: T) {
        return class extends superClass {
          public mixinProp = 'mixin';
        };
      }

      class Extended extends MyMixin(Parent) {}

      const instance = new Extended();
      expect(instance.grandProp).to.equal('grand');
      expect(instance.parentProp).to.equal('parent');
      expect(instance.mixinProp).to.equal('mixin');
    });

    it('allows mixin to access base class properties in methods', () => {
      class BaseClass {
        public items: string[] = [];
        public addItem(item: string) {
          this.items.push(item);
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public getItemCount() {
            return this.items.length;
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      instance.addItem('item1');
      instance.addItem('item2');
      expect(instance.getItemCount()).to.equal(2);
    });

    it('supports static members in base class', () => {
      class BaseClass {
        public static staticProp = 'static';
        public static staticMethod() {
          return 'static-method';
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public instanceMethod() {
            return 'instance';
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      expect(Extended.staticProp).to.equal('static');
      expect(Extended.staticMethod()).to.equal('static-method');
    });

    it('allows mixin to add static members', () => {
      class BaseClass {
        public baseProp = 'base';
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        const mixed = class extends superClass {
          public mixinProp = 'mixin';
        };
        // Add static member
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mixed as any).staticMixinProp = 'static-mixin';
        return mixed;
      }

      class Extended extends MyMixin(BaseClass) {}

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((Extended as any).staticMixinProp).to.equal('static-mixin');
    });

    it('preserves instanceof checks', () => {
      class BaseClass {}

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {};
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      expect(instance).to.be.instanceOf(Extended);
      expect(instance).to.be.instanceOf(BaseClass);
    });

    it('allows complex property types', () => {
      interface Config {
        name: string;
        value: number;
      }

      class BaseClass {
        public config: Config = {name: 'test', value: 42};
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public getConfigName() {
            return this.config.name;
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      expect(instance.getConfigName()).to.equal('test');
    });

    it('supports async methods in mixins', async () => {
      class BaseClass {
        public async fetchData() {
          return 'base-data';
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public async fetchExtendedData() {
            const baseData = await this.fetchData();
            return `${baseData}-extended`;
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      const result = await instance.fetchExtendedData();
      expect(result).to.equal('base-data-extended');
    });

    it('allows mixin to work with getters and setters', () => {
      class BaseClass {
        private _value = 0;
        public get value() {
          return this._value;
        }
        public set value(v: number) {
          this._value = v;
        }
      }

      function MyMixin<T extends MixinTarget<BaseClass>>(superClass: T) {
        return class extends superClass {
          public incrementValue() {
            this.value++;
          }
        };
      }

      class Extended extends MyMixin(BaseClass) {}

      const instance = new Extended();
      expect(instance.value).to.equal(0);
      instance.incrementValue();
      expect(instance.value).to.equal(1);
    });
  });

  describe('practical use cases', () => {
    it('can add repository functionality to application', () => {
      class Application {
        public name = 'MyApp';
        public bindings = new Map<string, unknown>();
      }

      function RepositoryMixin<T extends MixinTarget<Application>>(
        superClass: T,
      ) {
        return class extends superClass {
          public repositories = new Map<string, unknown>();

          public repository(name: string, repo: unknown) {
            this.repositories.set(name, repo);
            return this;
          }

          public getRepository(name: string) {
            return this.repositories.get(name);
          }
        };
      }

      class MyApp extends RepositoryMixin(Application) {}

      const app = new MyApp();
      const mockRepo = {find: () => []};
      app.repository('users', mockRepo);
      expect(app.getRepository('users')).to.equal(mockRepo);
    });

    it('can add service functionality to application', () => {
      class Application {
        public name = 'MyApp';
      }

      function ServiceMixin<T extends MixinTarget<Application>>(superClass: T) {
        return class extends superClass {
          public services = new Map<string, unknown>();

          public service(name: string, service: unknown) {
            this.services.set(name, service);
            return this;
          }
        };
      }

      class MyApp extends ServiceMixin(Application) {}

      const app = new MyApp();
      const mockService = {execute: () => 'result'};
      app.service('calculator', mockService);
      expect(app.services.get('calculator')).to.equal(mockService);
    });

    it('supports method chaining', () => {
      class Application {
        public name = 'MyApp';
      }

      function ConfigMixin<T extends MixinTarget<Application>>(superClass: T) {
        return class extends superClass {
          public config = new Map<string, unknown>();

          public setConfig(key: string, value: unknown) {
            this.config.set(key, value);
            return this;
          }
        };
      }

      class MyApp extends ConfigMixin(Application) {}

      const app = new MyApp();
      app.setConfig('port', 3000).setConfig('host', 'localhost');
      expect(app.config.get('port')).to.equal(3000);
      expect(app.config.get('host')).to.equal('localhost');
    });
  });
});

// Made with Bob
