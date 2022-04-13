// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, param, post, requestBody} from '@loopback/rest';
import {getModelSchema, Repository, typeorm} from '../../../';
import {Book} from '../typeorm-entities/book.entity';

export class BookController {
  constructor() {}

  @typeorm.repository(Book, 'my-db') private bookRepo: Repository<Book>;

  @post('/books', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchema(Book)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchema(Book, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    data: Omit<Book, 'id'>,
  ): Promise<Book> {
    const bookEntity = new Book();
    bookEntity.title = data.title;
    bookEntity.published = data.published;
    return this.bookRepo.save(bookEntity);
  }

  @get('/books/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchema(Book, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Book | null> {
    return this.bookRepo.findOne({where: {id}});
  }
}
