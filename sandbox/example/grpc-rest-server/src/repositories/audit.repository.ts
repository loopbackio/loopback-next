import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AuditLog} from '../models';
import {PgDataSource} from '../datasources';

export class AuditLogRepository extends DefaultCrudRepository<
  AuditLog,
  typeof AuditLog.prototype.id
> {
  constructor(
    @inject(`datasources.${PgDataSource}`) dataSource: PgDataSource,
  ) {
    super(AuditLog, dataSource);
  }
}
