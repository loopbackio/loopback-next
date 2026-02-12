// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {isTypeResolver, resolveType, TypeResolver} from '../../type-resolver';

describe('type-resolver', () => {
  class TestModel {
    id: number;
    name: string;
  }

  describe('isTypeResolver', () => {
    it('returns true for function type resolvers', () => {
      const resolver: TypeResolver<TestModel> = () => TestModel;
      expect(isTypeResolver(resolver)).to.be.true();
    });

    it('returns false for class constructors', () => {
      expect(isTypeResolver(TestModel)).to.be.false();
    });

    it('returns false for non-function values', () => {
      expect(isTypeResolver('string')).to.be.false();
      expect(isTypeResolver(123)).to.be.false();
      expect(isTypeResolver(null)).to.be.false();
      expect(isTypeResolver(undefined)).to.be.false();
      expect(isTypeResolver({})).to.be.false();
    });

    it('returns false for arrow functions that are not type resolvers', () => {
      const notResolver = () => 'not a type';
      expect(isTypeResolver(notResolver)).to.be.false();
    });
  });

  describe('resolveType', () => {
    it('resolves function type resolvers', () => {
      const resolver: TypeResolver<TestModel> = () => TestModel;
      const resolved = resolveType(resolver);
      expect(resolved).to.equal(TestModel);
    });

    it('returns class constructors as-is', () => {
      const resolved = resolveType(TestModel);
      expect(resolved).to.equal(TestModel);
    });

    it('handles type resolver functions', () => {
      const resolver: TypeResolver<TestModel> = () => TestModel;
      const resolved = resolveType(resolver);
      expect(resolved).to.equal(TestModel);
      expect(typeof resolved).to.equal('function');
    });

    it('resolves to the actual type from resolver function', () => {
      class AnotherModel {
        value: string;
      }
      const resolver: TypeResolver<AnotherModel> = () => AnotherModel;
      const resolved = resolveType(resolver);
      expect(resolved).to.equal(AnotherModel);

      const instance = new resolved();
      expect(instance).to.be.instanceOf(AnotherModel);
    });
  });

  describe('TypeResolver type', () => {
    it('accepts functions returning types', () => {
      const resolver: TypeResolver<TestModel> = () => TestModel;
      expect(resolver).to.be.a.Function();
      expect(resolver()).to.equal(TestModel);
    });

    it('works with generic types', () => {
      interface GenericModel<T> {
        data: T;
      }

      class StringModel implements GenericModel<string> {
        data: string;
      }

      const resolver: TypeResolver<GenericModel<string>> = () => StringModel;
      const resolved = resolveType(resolver);
      expect(resolved).to.equal(StringModel);
    });
  });

  describe('edge cases', () => {
    it('handles undefined gracefully', () => {
      const resolved = resolveType(
        undefined as unknown as TypeResolver<object>,
      );
      expect(resolved).to.be.undefined();
    });

    it('handles null gracefully', () => {
      const resolved = resolveType(null as unknown as TypeResolver<object>);
      expect(resolved).to.be.null();
    });

    it('resolves complex type hierarchies', () => {
      class BaseModel {
        id: number;
      }

      class DerivedModel extends BaseModel {
        name: string;
      }

      const resolver: TypeResolver<DerivedModel> = () => DerivedModel;
      const resolved = resolveType(resolver);
      expect(resolved).to.equal(DerivedModel);

      const instance = new resolved();
      expect(instance).to.be.instanceOf(DerivedModel);
      expect(instance).to.be.instanceOf(BaseModel);
    });
  });

  describe('type resolution with decorators', () => {
    it('resolves types used in model decorators', () => {
      class RelatedModel {
        id: number;
      }

      const typeResolver: TypeResolver<RelatedModel> = () => RelatedModel;
      const resolved = resolveType(typeResolver);

      expect(resolved).to.equal(RelatedModel);
    });
  });
});

// Made with Bob
