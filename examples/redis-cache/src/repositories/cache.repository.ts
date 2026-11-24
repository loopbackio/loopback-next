import {inject} from '@loopback/core';
import {DefaultKeyValueRepository} from '@loopback/repository';
import {CacheDataSource} from '../datasources';
import {Cache} from '../models';

export class CacheRepository extends DefaultKeyValueRepository<Cache> {
  constructor(@inject('datasources.cache') dataSource: CacheDataSource) {
    super(Cache, dataSource);
  }
}
