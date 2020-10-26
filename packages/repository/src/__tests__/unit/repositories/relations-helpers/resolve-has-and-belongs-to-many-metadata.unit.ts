// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Entity,
  HasAndBelongsToManyDefinition,
  model,
  ModelDefinition,
  property,
  RelationType,
} from '../../../..';
import {
  createTargetConstraintFromThrough,
  createThroughConstraintFromSource,
  createThroughConstraintFromTarget,
  getTargetIdsFromTargetModels,
  getTargetKeysFromThroughModels,
  HasAndBelongsToManyResolvedDefinition,
  resolveHasAndBelongsToManyMetadata,
} from '../../../../relations/has-and-belongs-to-many/has-and-belongs-to-many.helpers';

describe('HasAndBelongsToManyHelpers', () => {
  context('createThroughConstraintFromSource', () => {
    it('creates constraint for searching through models', () => {
      const result = createThroughConstraintFromSource(relationMetaData, 1);
      expect(result).to.containEql({rolId: 1});
    });
  });
  context('getTargetKeysFromThroughModels', () => {
    it('returns the target fk value of a given through instance', () => {
      const through1 = createRolesHasPermissions({
        rolId: 2,
        permissionId: 9,
      });
      const result = getTargetKeysFromThroughModels(relationMetaData, [
        through1,
      ]);
      expect(result).to.deepEqual([9]);
    });
    it('returns the target fk values of given through instances', () => {
      const through1 = createRolesHasPermissions({
        rolId: 2,
        permissionId: 9,
      });
      const through2 = createRolesHasPermissions({
        rolId: 2,
        permissionId: 8,
      });
      const result = getTargetKeysFromThroughModels(relationMetaData, [
        through1,
        through2,
      ]);
      expect(result).to.containDeep([9, 8]);
    });
  });
  context('createTargetConstraintFromThrough', () => {
    it('creates constraint for searching target models', () => {
      const through1 = createRolesHasPermissions({
        rolId: 2,
        permissionId: 9,
      });
      const through2 = createRolesHasPermissions({
        rolId: 2,
        permissionId: 8,
      });

      // single through model
      let result = createTargetConstraintFromThrough(relationMetaData, [
        through1,
      ]);
      expect(result).to.containEql({id: 9});
      // multiple through models
      result = createTargetConstraintFromThrough(relationMetaData, [
        through1,
        through2,
      ]);
      expect(result).to.containEql({id: {inq: [9, 8]}});
    });

    it('creates constraint for searching target models with duplicate keys', () => {
      const through1 = createRolesHasPermissions({
        rolId: 2,
        permissionId: 9,
      });
      const through2 = createRolesHasPermissions({
        rolId: 3,
        permissionId: 9,
      });

      const result = createTargetConstraintFromThrough(relationMetaData, [
        through1,
        through2,
      ]);
      expect(result).to.containEql({id: 9});
    });
  });

  context('getTargetIdsFromTargetModels', () => {
    it('returns an empty array if the given target array is empty', () => {
      const result = getTargetIdsFromTargetModels(relationMetaData, []);
      expect(result).to.containDeep([]);
    });
    it('creates constraint with a given fk', () => {
      const result = getTargetIdsFromTargetModels(relationMetaData, [
        createPermission({id: 1}),
      ]);
      expect(result).to.containDeep([1]);
    });
    it('creates constraint with given fks', () => {
      const result = getTargetIdsFromTargetModels(relationMetaData, [
        createPermission({id: 1}),
        createPermission({id: 2}),
      ]);
      expect(result).to.containDeep([1, 2]);
    });
  });

  context('createThroughConstraintFromTarget', () => {
    it('creates constraint with a given fk', () => {
      const result = createThroughConstraintFromTarget(relationMetaData, [1]);
      expect(result).to.containEql({permissionId: 1});
    });
    it('creates constraint with given fks', () => {
      const result = createThroughConstraintFromTarget(relationMetaData, [
        1,
        2,
      ]);
      expect(result).to.containEql({permissionId: {inq: [1, 2]}});
    });
    it('throws if fkValue is undefined', () => {
      expect(() =>
        createThroughConstraintFromTarget(relationMetaData, []),
      ).to.throw(/"fkValue" must be provided/);
    });
  });
  context('resolveHasManyThroughMetadata', () => {
    it('throws if the wrong metadata type is used', async () => {
      const metadata: unknown = {
        name: 'permission',
        type: RelationType.hasOne,
        targetsMany: false,
        source: Rol,
        target: () => Permission,
      };

      expect(() => {
        resolveHasAndBelongsToManyMetadata(
          metadata as HasAndBelongsToManyDefinition,
        );
      }).to.throw(
        /Invalid hasOne definition for Rol#permission: relation type must be HasAndBelongsToMany/,
      );
    });

    it('throws if the through is not provided', async () => {
      const metadata: unknown = {
        name: 'permission',
        type: RelationType.hasAndBelongsToMany,
        targetsMany: true,
        source: Rol,
        target: () => Permission,
      };

      expect(() => {
        resolveHasAndBelongsToManyMetadata(
          metadata as HasAndBelongsToManyDefinition,
        );
      }).to.throw(
        /Invalid hasAndBelongsToMany definition for Rol#permission: through must be specified/,
      );
    });

    it('throws if the source is not resolvable', async () => {
      const metadata: unknown = {
        name: 'permission',
        type: RelationType.hasAndBelongsToMany,
        targetsMany: true,
        source: 'random',
        target: () => Permission,
        through: {
          model: () => RolesHasPermissions,
        },
      };

      expect(() => {
        resolveHasAndBelongsToManyMetadata(
          metadata as HasAndBelongsToManyDefinition,
        );
      }).to.throw(
        /Invalid hasAndBelongsToMany definition for <Unknown Model>#permission: source model must be defined/,
      );
    });

    it('throws if the through is not resolvable', async () => {
      const metadata: unknown = {
        name: 'permission',
        type: RelationType.hasAndBelongsToMany,
        targetsMany: true,
        source: Rol,
        target: () => Permission,
        through: {model: 'random'},
      };

      expect(() => {
        resolveHasAndBelongsToManyMetadata(
          metadata as HasAndBelongsToManyDefinition,
        );
      }).to.throw(
        /Invalid hasAndBelongsToMany definition for Rol#permission: through model must be a type resolver/,
      );
    });

    it('throws if the target is not resolvable', async () => {
      const metadata: unknown = {
        name: 'permission',
        type: RelationType.hasAndBelongsToMany,
        targetsMany: true,
        source: Rol,
        target: 'random',
        through: {
          model: RolesHasPermissions,
        },
      };

      expect(() => {
        resolveHasAndBelongsToManyMetadata(
          metadata as HasAndBelongsToManyDefinition,
        );
      }).to.throw(
        /Invalid hasAndBelongsToMany definition for Rol#permission: target must be a type resolver/,
      );
    });

    describe('resolves through.sourceKey/targetKey', () => {
      it('resolves metadata with complete hasAndBelongsToMany definition', () => {
        const metadata = {
          name: 'permissions',
          type: RelationType.hasAndBelongsToMany,
          targetsMany: true,
          source: Rol,
          keyFrom: 'id',
          target: () => Permission,
          keyTo: 'id',

          through: {
            model: () => RolesHasPermissions,
            sourceKey: 'rolId',
            targetKey: 'permissionId',
          },
        };
        const meta = resolveHasAndBelongsToManyMetadata(
          metadata as HasAndBelongsToManyDefinition,
        );

        expect(meta).to.eql(relationMetaData);
      });

      it('infers through.sourceKey if it is not provided', () => {
        const metadata = {
          name: 'permissions',
          type: RelationType.hasAndBelongsToMany,
          targetsMany: true,
          source: Rol,
          keyFrom: 'id',
          target: () => Permission,
          keyTo: 'id',

          through: {
            model: () => RolesHasPermissions,
            // no through.sourceKey
            targetKey: 'permissionId',
          },
        };
        const meta = resolveHasAndBelongsToManyMetadata(
          metadata as HasAndBelongsToManyDefinition,
        );

        expect(meta).to.eql(relationMetaData);
      });

      it('infers through.targetKey if it is not provided', () => {
        const metadata = {
          name: 'permissions',
          type: RelationType.hasAndBelongsToMany,
          targetsMany: true,
          source: Rol,
          keyFrom: 'id',
          target: () => Permission,
          keyTo: 'id',

          through: {
            model: () => RolesHasPermissions,
            sourceKey: 'rolId',
            // no through.targetKey
          },
        };

        const meta = resolveHasAndBelongsToManyMetadata(
          metadata as HasAndBelongsToManyDefinition,
        );

        expect(meta).to.eql(relationMetaData);
      });

      it('throws if through.sourceKey is not provided in through', async () => {
        const metadata = {
          name: 'permissions',
          type: RelationType.hasAndBelongsToMany,
          targetsMany: true,
          source: Rol,
          keyFrom: 'id',
          target: () => Permission,
          keyTo: 'id',

          through: {
            model: () => InvalidThrough,
            targetKey: 'permissionId',
          },
        };

        expect(() => {
          resolveHasAndBelongsToManyMetadata(
            metadata as HasAndBelongsToManyDefinition,
          );
        }).to.throw(
          /Invalid hasAndBelongsToMany definition for Rol#permissions: through model InvalidThrough is missing definition of source foreign key/,
        );
      });

      it('throws if through.targetKey is not provided in through', async () => {
        const metadata = {
          name: 'permissions',
          type: RelationType.hasAndBelongsToMany,
          targetsMany: true,
          source: Rol,
          keyFrom: 'id',
          target: () => Permission,
          keyTo: 'id',

          through: {
            model: () => InvalidThrough2,
            sourceKey: 'rolId',
          },
        };

        expect(() => {
          resolveHasAndBelongsToManyMetadata(
            metadata as HasAndBelongsToManyDefinition,
          );
        }).to.throw(
          /Invalid hasAndBelongsToMany definition for Rol#permissions: through model InvalidThrough2 is missing definition of target foreign key/,
        );
      });

      it('throws if the target model does not have the id property', async () => {
        const metadata = {
          name: 'permissions',
          type: RelationType.hasAndBelongsToMany,
          targetsMany: true,
          source: Rol,
          keyFrom: 'id',
          target: () => InvalidPermission,
          keyTo: 'id',

          through: {
            model: () => RolesHasPermissions,
            sourceKey: 'rolId',
            targetKey: 'permissionId',
          },
        };

        expect(() => {
          resolveHasAndBelongsToManyMetadata(
            metadata as HasAndBelongsToManyDefinition,
          );
        }).to.throw(
          'Invalid hasAndBelongsToMany definition for Rol#permissions: target model InvalidPermission does not have any primary key (id property)',
        );
      });
    });
  });
  /******  HELPERS *******/

  @model()
  class Rol extends Entity {
    @property({id: true})
    id: number;

    constructor(data: Partial<Rol>) {
      super(data);
    }
  }

  @model()
  class Permission extends Entity {
    @property({id: true})
    id: number;

    constructor(data: Partial<Permission>) {
      super(data);
    }
  }

  @model()
  class InvalidPermission extends Entity {
    @property({id: false})
    random: number;

    constructor(data: Partial<InvalidPermission>) {
      super(data);
    }
  }

  @model()
  class RolesHasPermissions extends Entity {
    @property({id: true})
    rolId: number;
    @property({id: true})
    permissionId: number;

    constructor(data: Partial<RolesHasPermissions>) {
      super(data);
    }
  }

  const relationMetaData = {
    name: 'permissions',
    type: RelationType.hasAndBelongsToMany,
    targetsMany: true,
    source: Rol,
    keyFrom: 'id',
    target: () => Permission,
    keyTo: 'id',
    through: {
      model: () => RolesHasPermissions,
      sourceKey: 'rolId',
      targetKey: 'permissionId',
    },
  } as HasAndBelongsToManyResolvedDefinition;

  class InvalidThrough extends Entity {}
  InvalidThrough.definition = new ModelDefinition('InvalidThrough')
    // lack through.sourceKey
    .addProperty('permissionId', {type: 'number', id: true});

  class InvalidThrough2 extends Entity {}
  InvalidThrough2.definition = new ModelDefinition('InvalidThrough2')
    // lack through.targetKey
    .addProperty('rolId', {type: 'number', id: true});

  function createRolesHasPermissions(properties: Partial<RolesHasPermissions>) {
    return new RolesHasPermissions(properties);
  }

  function createPermission(properties: Partial<Permission>) {
    return new Permission(properties);
  }
});
