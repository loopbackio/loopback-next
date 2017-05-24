// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {NamespacedReflect, Reflector} from '../../src';
import 'reflect-metadata';

const namespace = 'sample-app-context';

describe('Reflect Context', () => {
  let reflectContext: NamespacedReflect;

  describe('with namespace', () => {
    beforeEach(givenReflectContextWithNameSpace);

    afterEach(resetMetadata);

    it('adds metadata to a class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, SubClass);

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', SubClass);
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass);
      expect(metadata).to.be.equal(metadataValue);

      // base class should not be impacted
      metadata = reflectContext.getOwnMetadata('key', BaseClass);
      expect(metadata).to.be.undefined();

      metadata = reflectContext.getMetadata('key', BaseClass);
      expect(metadata).to.be.undefined();
    });

    it('adds metadata to a static method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, SubClass, 'subStaticMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', SubClass, 'subStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass, 'subStaticMethod');
      expect(metadata).to.be.equal(metadataValue);
    });

    it('adds metadata to a prototype method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, SubClass.prototype, 'subMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', SubClass.prototype, 'subMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass.prototype, 'subMethod');
      expect(metadata).to.be.equal(metadataValue);
    });

    it('adds metadata to a base class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, BaseClass);

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', BaseClass);
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', BaseClass);
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass);
      expect(metadata).to.be.undefined();

      metadata = reflectContext.getMetadata('key', SubClass);
      expect(metadata).to.be.eql(metadataValue);
    });

    it('adds metadata to a base static method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, BaseClass, 'baseStaticMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', BaseClass, 'baseStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', BaseClass, 'baseStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should have the metadata too
      metadata = reflectContext.getMetadata('key', SubClass, 'baseStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should not own the metadata
      metadata = reflectContext.getOwnMetadata('key', SubClass, 'baseStaticMethod');
      expect(metadata).to.be.undefined();
    });

    it('adds metadata to a base prototype method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, BaseClass.prototype, 'baseMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', BaseClass.prototype, 'baseMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', BaseClass.prototype, 'baseMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should have the metadata too
      metadata = reflectContext.getMetadata('key', SubClass.prototype, 'baseMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should not own the metadata
      metadata = reflectContext.getOwnMetadata('key', SubClass.prototype, 'baseMethod');
      expect(metadata).to.be.undefined();
    });

    it('lists metadata keys of classes', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key1', metadataValue, SubClass);
      reflectContext.defineMetadata('key2', {}, BaseClass);

      let keys = reflectContext.getMetadataKeys(SubClass);
      expect(keys).to.eql(['key1', 'key2']);

      keys = reflectContext.getOwnMetadataKeys(SubClass);
      expect(keys).to.eql(['key1']);

      keys = reflectContext.getMetadataKeys(BaseClass);
      expect(keys).to.eql(['key2']);

      keys = reflectContext.getOwnMetadataKeys(BaseClass);
      expect(keys).to.eql(['key2']);
    });

    it('lists metadata keys of class methods', () => {
      const metadataValue: Object = {value: 'sample'};

      reflectContext.defineMetadata('key3', metadataValue, SubClass, 'staticSubMethod');
      reflectContext.defineMetadata('key4', metadataValue, BaseClass, 'staticBaseMethod');

      reflectContext.defineMetadata('key5', metadataValue, SubClass.prototype, 'subMethod');
      reflectContext.defineMetadata('key6', metadataValue, SubClass.prototype, 'baseMethod');
      reflectContext.defineMetadata('key7', metadataValue, BaseClass.prototype, 'baseMethod');

      let keys = reflectContext.getOwnMetadataKeys(SubClass, 'staticSubMethod');
      expect(keys).to.eql(['key3']);

      keys = reflectContext.getOwnMetadataKeys(SubClass, 'staticBaseMethod');
      expect(keys).to.eql([]);

      keys = reflectContext.getOwnMetadataKeys(BaseClass, 'staticBaseMethod');
      expect(keys).to.eql(['key4']);

      keys = reflectContext.getOwnMetadataKeys(SubClass.prototype, 'subMethod');
      expect(keys).to.eql(['key5']);

      keys = reflectContext.getOwnMetadataKeys(SubClass.prototype, 'baseMethod');
      expect(keys).to.eql(['key6']);

      keys = reflectContext.getMetadataKeys(SubClass.prototype, 'baseMethod');
      expect(keys).to.eql(['key6', 'key7']);

      keys = reflectContext.getOwnMetadataKeys(BaseClass.prototype, 'baseMethod');
      expect(keys).to.eql(['key7']);
    });


    it('checks hasMetadata against a class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key1', metadataValue, SubClass);
      reflectContext.defineMetadata('key2', {}, BaseClass);

      let result = reflectContext.hasMetadata('key1', SubClass);
      expect(result).to.be.true();

      result = reflectContext.hasMetadata('key2', SubClass);
      expect(result).to.be.true();

      result = reflectContext.hasMetadata('key1', BaseClass);
      expect(result).to.be.false();

      result = reflectContext.hasMetadata('key2', BaseClass);
      expect(result).to.be.true();
    });

    it('checks hasOwnMetadata against a class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key1', metadataValue, SubClass);
      reflectContext.defineMetadata('key2', {}, BaseClass);

      let result = reflectContext.hasOwnMetadata('key1', SubClass);
      expect(result).to.be.true();

      result = reflectContext.hasOwnMetadata('key2', SubClass);
      expect(result).to.be.false();

      result = reflectContext.hasOwnMetadata('key1', BaseClass);
      expect(result).to.be.false();

      result = reflectContext.hasOwnMetadata('key2', BaseClass);
      expect(result).to.be.true();
    });

  });

  describe('without namespace', () => {
    beforeEach(givenReflectContext);

    afterEach(resetMetadata);

    it('adds metadata to a class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, SubClass);

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', SubClass);
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass);
      expect(metadata).to.be.equal(metadataValue);

      // base class should not be impacted
      metadata = reflectContext.getOwnMetadata('key', BaseClass);
      expect(metadata).to.be.undefined();

      metadata = reflectContext.getMetadata('key', BaseClass);
      expect(metadata).to.be.undefined();
    });

    it('adds metadata to a static method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, SubClass, 'subStaticMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', SubClass, 'subStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass, 'subStaticMethod');
      expect(metadata).to.be.equal(metadataValue);
    });

    it('adds metadata to a prototype method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, SubClass.prototype, 'subMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', SubClass.prototype, 'subMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass.prototype, 'subMethod');
      expect(metadata).to.be.equal(metadataValue);
    });

    it('adds metadata to a base class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, BaseClass);

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', BaseClass);
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', BaseClass);
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass);
      expect(metadata).to.be.undefined();

      metadata = reflectContext.getMetadata('key', SubClass);
      expect(metadata).to.be.eql(metadataValue);
    });

    it('adds metadata to a base static method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, BaseClass, 'baseStaticMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', BaseClass, 'baseStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', BaseClass, 'baseStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should have the metadata too
      metadata = reflectContext.getMetadata('key', SubClass, 'baseStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should not own the metadata
      metadata = reflectContext.getOwnMetadata('key', SubClass, 'baseStaticMethod');
      expect(metadata).to.be.undefined();
    });

    it('adds metadata to a base prototype method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, BaseClass.prototype, 'baseMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', BaseClass.prototype, 'baseMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', BaseClass.prototype, 'baseMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should have the metadata too
      metadata = reflectContext.getMetadata('key', SubClass.prototype, 'baseMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should not own the metadata
      metadata = reflectContext.getOwnMetadata('key', SubClass.prototype, 'baseMethod');
      expect(metadata).to.be.undefined();
    });

    it('lists metadata keys of classes', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key1', metadataValue, SubClass);
      reflectContext.defineMetadata('key2', {}, BaseClass);

      let keys = reflectContext.getMetadataKeys(SubClass);
      expect(keys).to.eql(['key1', 'key2']);

      keys = reflectContext.getOwnMetadataKeys(SubClass);
      expect(keys).to.eql(['key1']);

      keys = reflectContext.getMetadataKeys(BaseClass);
      expect(keys).to.eql(['key2']);

      keys = reflectContext.getOwnMetadataKeys(BaseClass);
      expect(keys).to.eql(['key2']);
    });

    it('lists metadata keys of class methods', () => {
      const metadataValue: Object = {value: 'sample'};

      reflectContext.defineMetadata('key3', metadataValue, SubClass, 'staticSubMethod');
      reflectContext.defineMetadata('key4', metadataValue, BaseClass, 'staticBaseMethod');

      reflectContext.defineMetadata('key5', metadataValue, SubClass.prototype, 'subMethod');
      reflectContext.defineMetadata('key6', metadataValue, SubClass.prototype, 'baseMethod');
      reflectContext.defineMetadata('key7', metadataValue, BaseClass.prototype, 'baseMethod');

      let keys = reflectContext.getOwnMetadataKeys(SubClass, 'staticSubMethod');
      expect(keys).to.eql(['key3']);

      keys = reflectContext.getOwnMetadataKeys(SubClass, 'staticBaseMethod');
      expect(keys).to.eql([]);

      keys = reflectContext.getOwnMetadataKeys(BaseClass, 'staticBaseMethod');
      expect(keys).to.eql(['key4']);

      keys = reflectContext.getOwnMetadataKeys(SubClass.prototype, 'subMethod');
      expect(keys).to.eql(['key5']);

      keys = reflectContext.getOwnMetadataKeys(SubClass.prototype, 'baseMethod');
      expect(keys).to.eql(['key6']);

      keys = reflectContext.getMetadataKeys(SubClass.prototype, 'baseMethod');
      expect(keys).to.eql(['key6', 'key7']);

      keys = reflectContext.getOwnMetadataKeys(BaseClass.prototype, 'baseMethod');
      expect(keys).to.eql(['key7']);
    });


    it('checks hasMetadata against a class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key1', metadataValue, SubClass);
      reflectContext.defineMetadata('key2', {}, BaseClass);

      let result = reflectContext.hasMetadata('key1', SubClass);
      expect(result).to.be.true();

      result = reflectContext.hasMetadata('key2', SubClass);
      expect(result).to.be.true();

      result = reflectContext.hasMetadata('key1', BaseClass);
      expect(result).to.be.false();

      result = reflectContext.hasMetadata('key2', BaseClass);
      expect(result).to.be.true();
    });

    it('checks hasOwnMetadata against a class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key1', metadataValue, SubClass);
      reflectContext.defineMetadata('key2', {}, BaseClass);

      let result = reflectContext.hasOwnMetadata('key1', SubClass);
      expect(result).to.be.true();

      result = reflectContext.hasOwnMetadata('key2', SubClass);
      expect(result).to.be.false();

      result = reflectContext.hasOwnMetadata('key1', BaseClass);
      expect(result).to.be.false();

      result = reflectContext.hasOwnMetadata('key2', BaseClass);
      expect(result).to.be.true();
    });

  });

  describe('default Reflector', () => {
    beforeEach(givenReflectContext);

    afterEach(resetMetadata);

    it('adds metadata to a class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, SubClass);

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', SubClass);
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass);
      expect(metadata).to.be.equal(metadataValue);

      // base class should not be impacted
      metadata = reflectContext.getOwnMetadata('key', BaseClass);
      expect(metadata).to.be.undefined();

      metadata = reflectContext.getMetadata('key', BaseClass);
      expect(metadata).to.be.undefined();
    });

    it('adds metadata to a static method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, SubClass, 'subStaticMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', SubClass, 'subStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass, 'subStaticMethod');
      expect(metadata).to.be.equal(metadataValue);
    });

    it('adds metadata to a prototype method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, SubClass.prototype, 'subMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', SubClass.prototype, 'subMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass.prototype, 'subMethod');
      expect(metadata).to.be.equal(metadataValue);
    });

    it('adds metadata to a base class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, BaseClass);

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', BaseClass);
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', BaseClass);
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', SubClass);
      expect(metadata).to.be.undefined();

      metadata = reflectContext.getMetadata('key', SubClass);
      expect(metadata).to.be.eql(metadataValue);
    });

    it('adds metadata to a base static method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, BaseClass, 'baseStaticMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', BaseClass, 'baseStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', BaseClass, 'baseStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should have the metadata too
      metadata = reflectContext.getMetadata('key', SubClass, 'baseStaticMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should not own the metadata
      metadata = reflectContext.getOwnMetadata('key', SubClass, 'baseStaticMethod');
      expect(metadata).to.be.undefined();
    });

    it('adds metadata to a base prototype method', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key', metadataValue, BaseClass.prototype, 'baseMethod');

      // get the defined metadata using the namespaced reflectContext
      let metadata = reflectContext.getMetadata('key', BaseClass.prototype, 'baseMethod');
      expect(metadata).to.be.equal(metadataValue);

      metadata = reflectContext.getOwnMetadata('key', BaseClass.prototype, 'baseMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should have the metadata too
      metadata = reflectContext.getMetadata('key', SubClass.prototype, 'baseMethod');
      expect(metadata).to.be.equal(metadataValue);

      // sub class should not own the metadata
      metadata = reflectContext.getOwnMetadata('key', SubClass.prototype, 'baseMethod');
      expect(metadata).to.be.undefined();
    });

    it('lists metadata keys of classes', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key1', metadataValue, SubClass);
      reflectContext.defineMetadata('key2', {}, BaseClass);

      let keys = reflectContext.getMetadataKeys(SubClass);
      expect(keys).to.eql(['key1', 'key2']);

      keys = reflectContext.getOwnMetadataKeys(SubClass);
      expect(keys).to.eql(['key1']);

      keys = reflectContext.getMetadataKeys(BaseClass);
      expect(keys).to.eql(['key2']);

      keys = reflectContext.getOwnMetadataKeys(BaseClass);
      expect(keys).to.eql(['key2']);
    });

    it('lists metadata keys of class methods', () => {
      const metadataValue: Object = {value: 'sample'};

      reflectContext.defineMetadata('key3', metadataValue, SubClass, 'staticSubMethod');
      reflectContext.defineMetadata('key4', metadataValue, BaseClass, 'staticBaseMethod');

      reflectContext.defineMetadata('key5', metadataValue, SubClass.prototype, 'subMethod');
      reflectContext.defineMetadata('key6', metadataValue, SubClass.prototype, 'baseMethod');
      reflectContext.defineMetadata('key7', metadataValue, BaseClass.prototype, 'baseMethod');

      let keys = reflectContext.getOwnMetadataKeys(SubClass, 'staticSubMethod');
      expect(keys).to.eql(['key3']);

      keys = reflectContext.getOwnMetadataKeys(SubClass, 'staticBaseMethod');
      expect(keys).to.eql([]);

      keys = reflectContext.getOwnMetadataKeys(BaseClass, 'staticBaseMethod');
      expect(keys).to.eql(['key4']);

      keys = reflectContext.getOwnMetadataKeys(SubClass.prototype, 'subMethod');
      expect(keys).to.eql(['key5']);

      keys = reflectContext.getOwnMetadataKeys(SubClass.prototype, 'baseMethod');
      expect(keys).to.eql(['key6']);

      keys = reflectContext.getMetadataKeys(SubClass.prototype, 'baseMethod');
      expect(keys).to.eql(['key6', 'key7']);

      keys = reflectContext.getOwnMetadataKeys(BaseClass.prototype, 'baseMethod');
      expect(keys).to.eql(['key7']);
    });


    it('checks hasMetadata against a class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key1', metadataValue, SubClass);
      reflectContext.defineMetadata('key2', {}, BaseClass);

      let result = reflectContext.hasMetadata('key1', SubClass);
      expect(result).to.be.true();

      result = reflectContext.hasMetadata('key2', SubClass);
      expect(result).to.be.true();

      result = reflectContext.hasMetadata('key1', BaseClass);
      expect(result).to.be.false();

      result = reflectContext.hasMetadata('key2', BaseClass);
      expect(result).to.be.true();
    });

    it('checks hasOwnMetadata against a class', () => {
      const metadataValue: Object = {value: 'sample'};
      // define a metadata using the namespaced reflectContext
      reflectContext.defineMetadata('key1', metadataValue, SubClass);
      reflectContext.defineMetadata('key2', {}, BaseClass);

      let result = reflectContext.hasOwnMetadata('key1', SubClass);
      expect(result).to.be.true();

      result = reflectContext.hasOwnMetadata('key2', SubClass);
      expect(result).to.be.false();

      result = reflectContext.hasOwnMetadata('key1', BaseClass);
      expect(result).to.be.false();

      result = reflectContext.hasOwnMetadata('key2', BaseClass);
      expect(result).to.be.true();
    });

  });

  describe('@Reflector.metadata', () => {
    const val1 = {x: 1};
    const val2 = {y: 'a'};
    @Reflector.metadata('key1', val1)
    class TestClass {
      @Reflector.metadata('key2', val2)
      testMethod() {}
    }

    it('adds metadata', () => {
      let meta = Reflector.getOwnMetadata('key1', TestClass);
      expect(meta).to.eql(val1);
      meta = Reflector.getOwnMetadata('key2', TestClass.prototype, 'testMethod');
      expect(meta).to.eql(val2);
    });
  });

  describe('@Reflector.decorate', () => {
    const val1 = {x: 1};
    const val2 = {y: 'a'};

    class TestClass {
      testMethod() {}
    }

    it('adds metadata', () => {
      const x: ClassDecorator = Reflector.metadata('key1', val1);
      Reflector.decorate([x], TestClass);

      const y: MethodDecorator = Reflector.metadata('key2', val2);
      Reflector.decorate([y], TestClass.prototype, 'testMethod');

      let meta = Reflector.getOwnMetadata('key1', TestClass);
      expect(meta).to.eql(val1);

      meta = Reflector.getOwnMetadata('key2', TestClass.prototype, 'testMethod');
      expect(meta).to.eql(val2);
    });
  });

  function givenReflectContextWithNameSpace() {
    reflectContext = new NamespacedReflect(namespace);
  }

  function givenReflectContext() {
    reflectContext = new NamespacedReflect();
  }

  function givenDefaultReflector() {
    reflectContext = Reflector;
  }

  function deleteMetadata(target: Object, propertyKey?: string | symbol) {
    if (propertyKey) {
      const keys = reflectContext.getOwnMetadataKeys(target, propertyKey);
      for (const k of keys) {
        reflectContext.deleteMetadata(k, target, propertyKey);
      }
    } else {
      const keys = reflectContext.getOwnMetadataKeys(target);
      for (const k of keys) {
        reflectContext.deleteMetadata(k, target);
      }
    }
  }

  // Clean up the metadata
  function resetMetadata() {
    deleteMetadata(BaseClass);
    deleteMetadata(BaseClass, 'staticBaseMethod');
    deleteMetadata(BaseClass.prototype, 'baseMethod');

    deleteMetadata(SubClass);
    deleteMetadata(SubClass, 'staticSubMethod');
    deleteMetadata(SubClass.prototype, 'subMethod');
    deleteMetadata(SubClass.prototype, 'baseMethod');
  }

  class BaseClass {
    static staticBaseMethod() {}
    constructor() {}

    baseMethod() {}
  }

  class SubClass extends BaseClass {
    static staticSubMethod() {}

    constructor() {
      super();
    }

    baseMethod() {
      super.baseMethod();
    }

    subMethod(): boolean {
      return true;
    }
  }

});
