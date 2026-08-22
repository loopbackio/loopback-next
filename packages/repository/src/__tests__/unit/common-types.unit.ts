// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  AnyObject,
  Callback,
  Class,
  Command,
  Constructor,
  ConstructorFunction,
  Count,
  CountSchema,
  DataObject,
  DeepPartial,
  NamedParameters,
  Options,
  PositionalParameters,
  PrototypeOf,
} from '../..';

describe('common-types', () => {
  describe('CountSchema', () => {
    it('has correct structure', () => {
      expect(CountSchema.type).to.equal('object');
      expect(CountSchema.title).to.equal('loopback.Count');
      expect(CountSchema['x-typescript-type']).to.equal(
        '@loopback/repository#Count',
      );
      expect(CountSchema.properties).to.have.property('count');
      expect(CountSchema.properties.count.type).to.equal('number');
    });

    it('is compatible with Count interface', () => {
      const count: Count = {count: 5};
      expect(count.count).to.equal(5);
    });
  });

  describe('Count interface', () => {
    it('accepts valid count objects', () => {
      const count: Count = {count: 0};
      expect(count.count).to.equal(0);
    });

    it('accepts positive numbers', () => {
      const count: Count = {count: 100};
      expect(count.count).to.equal(100);
    });
  });

  describe('AnyObject type', () => {
    it('accepts objects with any properties', () => {
      const obj: AnyObject = {
        name: 'test',
        value: 123,
        nested: {prop: true},
      };
      expect(obj.name).to.equal('test');
      expect(obj.value).to.equal(123);
      expect(obj.nested.prop).to.equal(true);
    });
  });

  describe('Command type', () => {
    it('accepts string commands', () => {
      const cmd: Command = 'SELECT * FROM users';
      expect(cmd).to.be.a.String();
    });

    it('accepts object commands', () => {
      const cmd: Command = {operation: 'find', collection: 'users'};
      expect(cmd).to.be.an.Object();
    });
  });

  describe('NamedParameters type', () => {
    it('accepts named parameter objects', () => {
      const params: NamedParameters = {
        id: 1,
        name: 'John',
        active: true,
      };
      expect(params.id).to.equal(1);
      expect(params.name).to.equal('John');
      expect(params.active).to.equal(true);
    });
  });

  describe('PositionalParameters type', () => {
    it('accepts arrays of parameters', () => {
      const params: PositionalParameters = [1, 'John', true];
      expect(params).to.have.length(3);
      expect(params[0]).to.equal(1);
      expect(params[1]).to.equal('John');
      expect(params[2]).to.equal(true);
    });
  });

  describe('Callback type', () => {
    it('accepts callback with error', done => {
      const callback: Callback<string> = (err, result) => {
        expect(err).to.be.instanceOf(Error);
        expect(result).to.be.undefined();
        done();
      };
      callback(new Error('Test error'));
    });

    it('accepts callback with result', done => {
      const callback: Callback<string> = (err, result) => {
        expect(err).to.be.null();
        expect(result).to.equal('success');
        done();
      };
      callback(null, 'success');
    });
  });

  describe('Class type', () => {
    it('represents a class constructor', () => {
      class TestClass {
        constructor(public value: string) {}
      }
      const ClassRef: Class<TestClass> = TestClass;
      const instance = new ClassRef('test');
      expect(instance).to.be.instanceOf(TestClass);
      expect(instance.value).to.equal('test');
    });
  });

  describe('ConstructorFunction type', () => {
    it('represents a constructor function', () => {
      function testConstructor(this: {value: string}, value: string) {
        this.value = value;
      }
      const ctor: ConstructorFunction<{value: string}> =
        testConstructor as unknown as ConstructorFunction<{value: string}>;
      expect(ctor).to.be.a.Function();
    });
  });

  describe('Constructor type', () => {
    it('accepts class constructors', () => {
      class TestClass {
        constructor(public value: string) {}
      }
      const ctor: Constructor<TestClass> = TestClass;
      const instance = new ctor('test');
      expect(instance.value).to.equal('test');
    });
  });

  describe('DeepPartial type', () => {
    interface NestedObject {
      level1: {
        level2: {
          value: string;
        };
      };
    }

    it('allows partial nested objects', () => {
      const partial: DeepPartial<NestedObject> = {
        level1: {
          level2: {},
        },
      };
      expect(partial.level1).to.be.an.Object();
    });

    it('allows completely empty objects', () => {
      const partial: DeepPartial<NestedObject> = {};
      expect(partial).to.be.an.Object();
    });
  });

  describe('DataObject type', () => {
    interface TestModel {
      id: number;
      name: string;
    }

    it('accepts full objects', () => {
      const data: DataObject<TestModel> = {
        id: 1,
        name: 'Test',
      };
      expect(data.id).to.equal(1);
      expect(data.name).to.equal('Test');
    });

    it('accepts partial objects', () => {
      const data: DataObject<TestModel> = {
        name: 'Test',
      };
      expect(data.name).to.equal('Test');
    });
  });

  describe('Options type', () => {
    it('accepts any object as options', () => {
      const options: Options = {
        timeout: 5000,
        retries: 3,
        verbose: true,
      };
      expect(options.timeout).to.equal(5000);
      expect(options.retries).to.equal(3);
      expect(options.verbose).to.equal(true);
    });
  });

  describe('PrototypeOf type', () => {
    it('infers prototype from constructor', () => {
      class TestEntity {
        id: number;
        constructor(id: number) {
          this.id = id;
        }
      }
      type EntityPrototype = PrototypeOf<typeof TestEntity>;
      const entity: EntityPrototype = new TestEntity(1);
      expect(entity.id).to.equal(1);
    });
  });
});

// Made with Bob
