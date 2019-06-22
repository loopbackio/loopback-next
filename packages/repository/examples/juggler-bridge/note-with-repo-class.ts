// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject} from '@loopback/context';

import {
  repository,
  Entity,
  juggler,
  EntityCrudRepository,
  DefaultCrudRepository,
  ModelDefinition,
} from '../../';

const ds: juggler.DataSource = new juggler.DataSource({
  name: 'db',
  connector: 'memory',
});

class Note extends Entity {
  static definition = new ModelDefinition({
    name: 'note',
    properties: {title: 'string', content: 'string'},
  });

  title: string;
  content?: string;
}

class NoteController {
  @repository('noteRepo')
  public noteRepo: EntityCrudRepository<Note, number>;
}

class MyNoteRepository extends DefaultCrudRepository<Note, string> {
  constructor(
    @inject('models.Note') myModel: typeof Note,
    // FIXME For some reason ts-node fails by complaining that
    // juggler is undefined if the following is used:
    // @inject('dataSources.memory') dataSource: juggler.DataSource
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @inject('dataSources.memory') dataSource: any,
  ) {
    super(myModel, dataSource);
  }
}

async function main() {
  // Create a context
  const ctx = new Context();

  // Bind model `Note`
  ctx.bind('models.Note').to(Note);

  // Bind the in-memory DB dataSource
  ctx.bind('dataSources.memory').to(ds);

  // Bind the repository class
  ctx.bind('repositories.noteRepo').toClass(MyNoteRepository);

  // Bind the controller class
  ctx.bind('controllers.MyController').toClass(NoteController);

  // Resolve the controller
  const controller = await ctx.get<NoteController>('controllers.MyController');

  // Create some notes
  await controller.noteRepo.create({title: 't1', content: 'Note 1'});
  await controller.noteRepo.create({title: 't2', content: 'Note 2'});
  // Find all notes
  const notes = await controller.noteRepo.find();
  return notes;
}

// Invoke the example
main()
  .then(notes => {
    // It should print out:
    // ```
    // Notes [ { title: 't1', content: 'Note 1', id: 1 },
    // { title: 't2', content: 'Note 2', id: 2 } ]
    // ```
    console.log('Notes', notes);
  })
  .catch(err => {
    // It should not happen
    console.error(err);
  });
