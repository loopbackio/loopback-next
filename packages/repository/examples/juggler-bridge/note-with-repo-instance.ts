// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject} from '@loopback/context';

import {
  repository,
  Repository,
  DataSourceConstructor,
  juggler,
  Entity,
  Options,
  DataObject,
  Filter,
  EntityCrudRepository,
  DefaultCrudRepository,
  ModelDefinition,
} from '../../';

// The Controller for Note
class NoteController {
  constructor(
    @repository('noteRepo')
    public noteRepo: EntityCrudRepository<Entity, number>,
  ) {}

  create(data: DataObject<Entity>, options?: Options) {
    return this.noteRepo.create(data, options);
  }

  findByTitle(title: string, options?: Options) {
    return this.noteRepo.find({where: {title}}, options);
  }
}

const ds: juggler.DataSource = new DataSourceConstructor({
  name: 'db',
  connector: 'memory',
});

class Note extends Entity {
  static definition = new ModelDefinition({
    name: 'note',
    properties: {title: 'string', content: 'string'},
  });
}

async function main() {
  // Create a context
  const ctx = new Context();

  // Mock up a predefined repository
  const repo = new DefaultCrudRepository(Note, ds);

  // Bind the repository instance
  ctx.bind('repositories.noteRepo').to(repo);

  // Bind the controller class
  ctx.bind('controllers.MyController').toClass(NoteController);

  // Resolve the controller
  const controller: NoteController = await ctx.get('controllers.MyController');

  // Create some notes
  await controller.create({title: 't1', content: 'Note 1'});
  await controller.create({title: 't2', content: 'Note 2'});

  // Find notes by title
  const notes = await controller.findByTitle('t1');
  return notes;
}

// Invoke the example
main().then(notes => {
  // It should print `Notes [ { title: 't1', content: 'Note 1', id: 1 } ]`
  console.log('Notes', notes);
}).catch(err => {
  // It should not happen
  console.error(err);
});

