// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {Todo} from '../../../models';
import {TodoRepository} from '../../../repositories';

describe('TodoRepository (unit)', () => {
  let repository: TodoRepository;
  let dataSource: juggler.DataSource;

  beforeEach(() => {
    dataSource = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
    repository = new TodoRepository(dataSource);
  });

  describe('constructor', () => {
    it('creates repository with datasource', () => {
      expect(repository).to.be.instanceOf(TodoRepository);
    });

    it('uses Todo model', () => {
      expect(repository.entityClass).to.equal(Todo);
    });
  });

  describe('CRUD operations', () => {
    it('creates a todo', async () => {
      const todo = new Todo({
        title: 'Test Todo',
        desc: 'Test Description',
        isComplete: false,
      });

      const created = await repository.create(todo);

      expect(created).to.have.property('id');
      expect(created.title).to.equal('Test Todo');
      expect(created.desc).to.equal('Test Description');
      expect(created.isComplete).to.equal(false);
    });

    it('finds all todos', async () => {
      await repository.create(
        new Todo({
          title: 'Todo 1',
          isComplete: false,
        }),
      );
      await repository.create(
        new Todo({
          title: 'Todo 2',
          isComplete: true,
        }),
      );

      const todos = await repository.find();

      expect(todos).to.have.length(2);
    });

    it('finds todos by filter', async () => {
      await repository.create(
        new Todo({
          title: 'Incomplete Todo',
          isComplete: false,
        }),
      );
      await repository.create(
        new Todo({
          title: 'Complete Todo',
          isComplete: true,
        }),
      );

      const incompleteTodos = await repository.find({
        where: {isComplete: false},
      });

      expect(incompleteTodos).to.have.length(1);
      expect(incompleteTodos[0].title).to.equal('Incomplete Todo');
    });

    it('finds todo by id', async () => {
      const created = await repository.create(
        new Todo({
          title: 'Find Me',
          isComplete: false,
        }),
      );

      const found = await repository.findById(created.id);

      expect(found.id).to.equal(created.id);
      expect(found.title).to.equal('Find Me');
    });

    it('updates todo by id', async () => {
      const created = await repository.create(
        new Todo({
          title: 'Update Me',
          isComplete: false,
        }),
      );

      await repository.updateById(created.id, {isComplete: true});

      const updated = await repository.findById(created.id);
      expect(updated.isComplete).to.equal(true);
    });

    it('deletes todo by id', async () => {
      const created = await repository.create(
        new Todo({
          title: 'Delete Me',
          isComplete: false,
        }),
      );

      await repository.deleteById(created.id);

      const count = await repository.count();
      expect(count.count).to.equal(0);
    });

    it('counts todos', async () => {
      await repository.create(
        new Todo({
          title: 'Todo 1',
          isComplete: false,
        }),
      );
      await repository.create(
        new Todo({
          title: 'Todo 2',
          isComplete: false,
        }),
      );

      const count = await repository.count();

      expect(count.count).to.equal(2);
    });

    it('counts todos with where clause', async () => {
      await repository.create(
        new Todo({
          title: 'Incomplete',
          isComplete: false,
        }),
      );
      await repository.create(
        new Todo({
          title: 'Complete',
          isComplete: true,
        }),
      );

      const count = await repository.count({isComplete: true});

      expect(count.count).to.equal(1);
    });
  });

  describe('advanced queries', () => {
    it('supports ordering', async () => {
      await repository.create(
        new Todo({
          title: 'B Todo',
          isComplete: false,
        }),
      );
      await repository.create(
        new Todo({
          title: 'A Todo',
          isComplete: false,
        }),
      );

      const todos = await repository.find({order: ['title ASC']});

      expect(todos[0].title).to.equal('A Todo');
      expect(todos[1].title).to.equal('B Todo');
    });

    it('supports limiting results', async () => {
      await repository.create(
        new Todo({
          title: 'Todo 1',
          isComplete: false,
        }),
      );
      await repository.create(
        new Todo({
          title: 'Todo 2',
          isComplete: false,
        }),
      );
      await repository.create(
        new Todo({
          title: 'Todo 3',
          isComplete: false,
        }),
      );

      const todos = await repository.find({limit: 2});

      expect(todos).to.have.length(2);
    });

    it('supports field selection', async () => {
      await repository.create(
        new Todo({
          title: 'Test Todo',
          desc: 'Test Description',
          isComplete: false,
        }),
      );

      const todos = await repository.find({
        fields: {title: true, isComplete: true},
      });

      expect(todos[0]).to.have.property('title');
      expect(todos[0]).to.have.property('isComplete');
      // desc should not be included
      expect(todos[0].desc).to.be.undefined();
    });
  });
});

// Made with Bob
