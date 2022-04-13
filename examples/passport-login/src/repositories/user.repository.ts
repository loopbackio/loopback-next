// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {User, UserCredentials, UserIdentity} from '../models';
import {UserCredentialsRepository} from './user-credentials.repository';
import {UserIdentityRepository} from './user-identity.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  public readonly profiles: HasManyRepositoryFactory<
    UserIdentity,
    typeof User.prototype.id
  >;

  public readonly credentials: HasOneRepositoryFactory<
    UserCredentials,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('UserIdentityRepository')
    protected profilesGetter: Getter<UserIdentityRepository>,
    @repository.getter('UserCredentialsRepository')
    protected credentialsGetter: Getter<UserCredentialsRepository>,
  ) {
    super(User, dataSource);
    this.profiles = this.createHasManyRepositoryFactoryFor(
      'profiles',
      profilesGetter,
    );
    this.registerInclusionResolver('profiles', this.profiles.inclusionResolver);

    this.credentials = this.createHasOneRepositoryFactoryFor(
      'credentials',
      credentialsGetter,
    );
    this.registerInclusionResolver(
      'credentials',
      this.credentials.inclusionResolver,
    );
  }
}
