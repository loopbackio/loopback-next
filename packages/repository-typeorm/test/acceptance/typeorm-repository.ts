// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository-typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TypeORMDataSource, TypeORMRepository} from '../..';
import {MysqlConnectionOptions} from 'typeorm/driver/mysql/MysqlConnectionOptions';

import {Entity as Base} from '@loopback/repository';
import {Entity, Column, PrimaryGeneratedColumn, Repository} from 'typeorm';

describe('TypeORM Repository', () => {
  @Entity('NOTE')
  class Note extends Base {
    @PrimaryGeneratedColumn() id: number;

    @Column({
      length: 100,
    })
    title: string;

    @Column('text') content: string;
  }

  const options: MysqlConnectionOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'pass',
    database: 'TESTDB',
    entities: [Note],
  };

  let repository: TypeORMRepository<Note, number>;

  before(() => {
    const ds = new TypeORMDataSource(options);
    repository = new TypeORMRepository(ds, Note);
  });

  it('creates new instances', async () => {
    let result = await repository.create({
      title: 'Note1',
      content: 'This is note #1',
    });
    console.log(result);
    result = await repository.create({
      title: 'Note2',
      content: 'This is note #2',
    });
    console.log(result);
  });

  it('finds matching instances', async () => {
    const result = await repository.find();
    console.log(result);
  });

  it('finds matching instances with filter', async () => {
    const result = await repository.find({
      limit: 2,
      order: ['title DESC'],
      where: {id: {lt: 5}},
    });
    console.log(result);
  });

  it('updates matching instances', async () => {
    const result = await repository.updateAll(
      {content: 'This is note #2 - edited'},
      {id: 2},
    );
    console.log(result);
  });

  it('deletes all instances', async () => {
    const result = await repository.deleteAll({});
    console.log(result);
  });
});
