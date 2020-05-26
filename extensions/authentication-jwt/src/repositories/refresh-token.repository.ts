import {inject} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {RefreshToken, RefreshTokenRelations} from '../models';
import {RefreshTokenBindings, UserServiceBindings} from '../keys';

export class RefreshTokenRepository extends DefaultCrudRepository<
  RefreshToken,
  typeof RefreshToken.prototype.id,
  RefreshTokenRelations
> {
  constructor(
    @inject(`datasources.${RefreshTokenBindings.DATASOURCE_NAME}`)
    dataSource: juggler.DataSource,
  ) {
    super(RefreshToken, dataSource);
  }
}
