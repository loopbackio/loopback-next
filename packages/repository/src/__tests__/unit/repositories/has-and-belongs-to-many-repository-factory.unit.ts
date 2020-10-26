// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createStubInstance, expect} from '@loopback/testlab';
import {
  DefaultCrudRepository,
  Entity,
  Getter,
  juggler,
  model,
  property,
  RelationType,
} from '../../..';
import {createHasAndBelongsToManyRepositoryFactory} from '../../../relations/has-and-belongs-to-many';
import {HasAndBelongsToManyResolvedDefinition} from '../../../relations/has-and-belongs-to-many/has-and-belongs-to-many.helpers';

describe('createHasAndBelongsToManyRepositoryFactory', () => {
  let rolesHasPermissionsRepo: RolesHasPermissionsRepository;
  let permissionRepo: PermissionRepository;

  beforeEach(() => {
    givenStubbedRolesHasPermissionsRepo();
    givenStubbedPermissionRepo();
  });

  it('should return a function that could create hasManyThrough repository', () => {
    const relationMeta = resolvedMetadata as HasAndBelongsToManyResolvedDefinition;
    const result = createHasAndBelongsToManyRepositoryFactory(
      relationMeta,
      Getter.fromValue(rolesHasPermissionsRepo),
      Getter.fromValue(permissionRepo),
    );
    expect(result).to.be.Function();
  });

  /*------------- HELPERS ---------------*/

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
  class RolesHasPermissions extends Entity {
    @property({id: true})
    rolId: number;
    @property({id: true})
    permissionId: number;

    constructor(data: Partial<RolesHasPermissions>) {
      super(data);
    }
  }

  class PermissionRepository extends DefaultCrudRepository<
    Permission,
    typeof Permission.prototype.id
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Permission, dataSource);
    }
  }

  class RolesHasPermissionsRepository extends DefaultCrudRepository<
    RolesHasPermissions,
    typeof RolesHasPermissions.prototype.rolId
  > {
    constructor(dataSource: juggler.DataSource) {
      super(RolesHasPermissions, dataSource);
    }
  }

  const resolvedMetadata = {
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

  function givenStubbedRolesHasPermissionsRepo() {
    rolesHasPermissionsRepo = createStubInstance(RolesHasPermissionsRepository);
  }

  function givenStubbedPermissionRepo() {
    permissionRepo = createStubInstance(PermissionRepository);
  }
});
