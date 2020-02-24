import {Constructor} from '@loopback/core';
import {getModelSchemaRef, post, requestBody} from '../../../';
import {
  FindByTitleControllerMixin,
  FindByTitleControllerMixinOptions,
} from '../mixins/find-by-title-controller-mixin';
import {Note} from '../models/note.model';

export const groceryNote = new Note({
  id: 1,
  title: 'groceries',
  content: 'eggs,bacon',
});

class StubRepo {
  async findByTitle(title: string): Promise<Note[]> {
    return title ? Promise.resolve([groceryNote]) : Promise.reject();
  }

  async create(note: Partial<Note>): Promise<Note> {
    return Promise.resolve(groceryNote);
  }
}

/*
 * This controller has a stub repository and is just used
 * to confirm that a mixin is able to add a new
 * method to its list of methods.
 */
const options: FindByTitleControllerMixinOptions = {
  basePath: '/notes',
  modelClass: Note,
};

export class NoteController extends FindByTitleControllerMixin<
  Note,
  Constructor<Object>
>(Object, options) {
  repository: StubRepo;

  constructor() {
    super();
    this.repository = new StubRepo();
  }

  @post('/notes', {
    responses: {
      '200': {
        description: 'Note model instance',
        content: {'application/json': {schema: getModelSchemaRef(Note)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Note, {
            title: 'NewNote',
            exclude: ['id'],
          }),
        },
      },
    })
    note: Omit<Note, 'id'>,
  ): Promise<Note> {
    return this.repository.create(note);
  }
}
