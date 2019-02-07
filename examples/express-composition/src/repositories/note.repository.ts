import {DefaultCrudRepository} from '@loopback/repository';
import {Note} from '../models';
import {DsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class NoteRepository extends DefaultCrudRepository<
  Note,
  typeof Note.prototype.id
> {
  constructor(@inject('datasources.ds') dataSource: DsDataSource) {
    super(Note, dataSource);
  }
}
