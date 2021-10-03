// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, toJSON} from '@loopback/testlab';
import {cloneDeep} from 'lodash';
import {
  bindModel,
  DefaultCrudRepository,
  DefaultTransactionalRepository,
  Entity,
  EntityNotFoundError,
  juggler,
  model,
  ModelDefinition,
  property,
} from '../../..';
import {
  belongsTo,
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  createHasManyRepositoryFactory,
  createHasOneRepositoryFactory,
  hasMany,
  HasManyDefinition,
  HasManyRepositoryFactory,
  hasOne,
  HasOneDefinition,
  HasOneRepositoryFactory,
  InclusionResolver,
} from '../../../relations';
import {CrudConnectorStub} from '../crud-connector.stub';
const TransactionClass = require('loopback-datasource-juggler').Transaction;

describe('legacy loopback-datasource-juggler', () => {
  let ds: juggler.DataSource;

  before(function () {
    ds = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
    expect(ds.settings.name).to.eql('db');
    expect(ds.settings.connector).to.eql('memory');
  });

  it('creates models', () => {
    const Note = ds.createModel<juggler.PersistedModelClass>(
      'note',
      {title: 'string', content: 'string', id: {type: 'number', id: true}},
      {},
    );
    const Note2 = bindModel(Note, ds);
    expect(Note2.modelName).to.eql('note');
    expect(Note2.definition).to.eql(Note.definition);
    expect(Note2.create).to.exactly(Note.create);
  });
});

describe('DefaultCrudRepository', () => {
  let ds: juggler.DataSource;

  class Note extends Entity {
    static definition = new ModelDefinition({
      name: 'Note',
      properties: {
        title: 'string',
        content: 'string',
        id: {name: 'id', type: 'number', id: true},
      },
    });

    title?: string;
    content?: string;
    id: number;

    constructor(data: Partial<Note>) {
      super(data);
    }
  }

  beforeEach(() => {
    ds = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
  });

  context('constructor', () => {
    class ShoppingList extends Entity {
      static definition = new ModelDefinition({
        name: 'ShoppingList',
        properties: {
          id: {
            type: 'number',
            id: true,
          },
          created: {
            type: () => Date,
          },
          toBuy: {
            type: 'array',
            itemType: 'string',
          },
          toVisit: {
            type: Array,
            itemType: () => String,
          },
        },
      });

      created: Date;
      toBuy: string[];
      toVisit: string[];
    }

    it('converts PropertyDefinition with array type', () => {
      const originalPropertyDefinition = Object.assign(
        {},
        ShoppingList.definition.properties,
      );
      const listDefinition = new DefaultCrudRepository(ShoppingList, ds)
        .modelClass.definition;
      const jugglerPropertyDefinition = {
        created: {type: Date},
        toBuy: {
          type: [String],
        },
        toVisit: {
          type: [String],
        },
      };

      expect(listDefinition.properties).to.containDeep(
        jugglerPropertyDefinition,
      );
      expect(ShoppingList.definition.properties).to.containDeep(
        originalPropertyDefinition,
      );
    });

    it('converts PropertyDefinition with model type', () => {
      @model()
      class Role {
        @property()
        name: string;
      }

      @model()
      class Address {
        @property()
        street: string;
      }

      @model()
      class User extends Entity {
        @property({
          type: 'number',
          id: true,
        })
        id: number;

        @property({type: 'string'})
        name: string;

        @property.array(Role)
        roles: Role[];

        @property()
        address: Address;
      }

      expect(ds.getModel('User')).undefined();

      new DefaultCrudRepository(User, ds);

      const JugglerUser = ds.getModel('User')!;
      expect(JugglerUser).to.be.a.Function();

      const addressProperty = JugglerUser.definition.properties.address;
      const addressModel = addressProperty.type as typeof juggler.ModelBase;
      expect(addressModel).to.be.a.Function();
      expect(addressModel).to.equal(ds.getModel('Address'));

      expect(addressModel.name).to.equal('Address');
      expect(addressModel.definition).to.containDeep({
        name: 'Address',
        properties: {street: {type: String}},
      });

      const rolesProperty = JugglerUser.definition.properties.roles;
      expect(rolesProperty.type).to.be.an.Array().of.length(1);

      // FIXME(bajtos) PropertyDefinition in juggler does not allow array type!
      const rolesModel =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rolesProperty.type as any)[0] as typeof juggler.ModelBase;
      expect(rolesModel).to.be.a.Function();
      expect(rolesModel).to.equal(ds.getModel('Role'));

      expect(rolesModel.name).to.equal('Role');
      expect(rolesModel.definition).to.containDeep({
        name: 'Role',
        properties: {name: {type: String}},
      });

      // issue 2912: make sure the juggler leaves the original model definition alone
      expect(User.definition.properties.roles.itemType).to.equal(Role);
      expect(User.definition.properties.address.type).to.equal(Address);
    });

    it('handles recursive model references', () => {
      @model()
      class ReportState extends Entity {
        @property({id: true})
        id: string;

        @property.array(ReportState, {})
        states: ReportState[];

        @property({
          type: 'string',
        })
        benchmarkId?: string;

        @property({
          type: 'string',
        })
        color?: string;

        constructor(data?: Partial<ReportState>) {
          super(data);
        }
      }
      const repo = new DefaultCrudRepository(ReportState, ds);
      const definition = repo.modelClass.definition;
      const typeOfStates = definition.properties.states.type;
      expect(typeOfStates).to.eql([repo.modelClass]);
    });
  });

  it('shares the backing PersistedModel across repo instances', () => {
    const model1 = new DefaultCrudRepository(Note, ds).modelClass;
    const model2 = new DefaultCrudRepository(Note, ds).modelClass;

    expect(model1 === model2).to.be.true();
  });

  it('implements Repository.create()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({title: 't3', content: 'c3'});
    const result = await repo.findById(note.id);
    expect(result.toJSON()).to.eql(note.toJSON());
  });

  it('implements Repository.createAll()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const notes = await repo.createAll([
      {title: 't3', content: 'c3'},
      {title: 't4', content: 'c4'},
    ]);
    expect(notes.length).to.eql(2);
  });

  describe('find', () => {
    it('is implemented', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      await repo.createAll([
        {title: 't1', content: 'c1'},
        {title: 't2', content: 'c2'},
      ]);
      const notes = await repo.find({where: {title: 't1'}});
      expect(notes.length).to.eql(1);
    });

    it('does not manipulate the original filter', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      const filter = {where: {title: 't1'}};
      const originalFilter = cloneDeep(filter);
      await repo.createAll([
        {title: 't1', content: 'c1'},
        {title: 't2', content: 'c2'},
      ]);
      await repo.find(filter);
      expect(filter).to.deepEqual(originalFilter);
    });
  });

  describe('findOne', () => {
    it('is implemented', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      await repo.createAll([
        {title: 't1', content: 'c1'},
        {title: 't1', content: 'c2'},
      ]);
      const note = await repo.findOne({
        where: {title: 't1'},
        order: ['content DESC'],
      });
      expect(note).to.not.be.null();
      expect(note?.title).to.eql('t1');
      expect(note?.content).to.eql('c2');
    });

    it('returns null if instances were found', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      await repo.createAll([
        {title: 't1', content: 'c1'},
        {title: 't1', content: 'c2'},
      ]);
      const note = await repo.findOne({
        where: {title: 't5'},
        order: ['content DESC'],
      });
      expect(note).to.be.null();
    });

    it('does not manipulate the original filter', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      const filter = {
        where: {title: 't5'},
        order: ['content DESC'],
      };
      const originalFilter = cloneDeep(filter);
      await repo.createAll([
        {title: 't1', content: 'c1'},
        {title: 't1', content: 'c2'},
      ]);
      await repo.findOne(filter);
      expect(filter).to.deepEqual(originalFilter);
    });
  });

  describe('findById', () => {
    it('returns the correct instance', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      const note = await repo.create({title: 'a-title', content: 'a-content'});
      const result = await repo.findById(note.id);
      expect(result?.toJSON()).to.eql(note.toJSON());
    });

    it('returns the correct instance with fields', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      const note = await repo.create({title: 'a-title', content: 'a-content'});
      const result = await repo.findById(note.id, {fields: {title: true}});
      expect(result?.toJSON()).to.eql({title: 'a-title'});
    });

    it('does not manipulate the original filter', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      const filter = {fields: {title: true, content: true}};
      const originalFilter = cloneDeep(filter);
      const note = await repo.create({title: 'a-title', content: 'a-content'});
      await repo.findById(note.id, filter);
      expect(filter).to.deepEqual(originalFilter);
    });

    it('throws when the instance does not exist', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      await expect(repo.findById(999999)).to.be.rejectedWith({
        code: 'ENTITY_NOT_FOUND',
        message: 'Entity not found: Note with id 999999',
      });
    });
  });

  describe('DefaultCrudRepository with relations', () => {
    @model()
    class Author extends Entity {
      @property({id: true})
      id?: number;
      @property()
      name: string;
      @belongsTo(() => Folder)
      folderId: number;
    }

    @model()
    class Folder extends Entity {
      @property({id: true})
      id?: number;
      @property()
      name: string;
      @hasMany(() => File)
      files: File[];
      @hasOne(() => Author)
      author: Author;
    }

    @model()
    class File extends Entity {
      @property({id: true})
      id?: number;
      @property()
      title: string;
      @belongsTo(() => Folder)
      folderId: number;
    }

    @model()
    class Account extends Entity {
      @property({id: true})
      id?: number;
      @property()
      name: string;
      @belongsTo(() => Author, {name: 'author'})
      author: number;
    }

    let folderRepo: DefaultCrudRepository<Folder, unknown, {}>;
    let fileRepo: DefaultCrudRepository<File, unknown, {}>;
    let authorRepo: DefaultCrudRepository<Author, unknown, {}>;
    let accountRepo: DefaultCrudRepository<Account, unknown, {}>;

    let folderFiles: HasManyRepositoryFactory<File, typeof Folder.prototype.id>;
    let fileFolder: BelongsToAccessor<Folder, typeof File.prototype.id>;
    let folderAuthor: HasOneRepositoryFactory<
      Author,
      typeof Folder.prototype.id
    >;

    before(() => {
      ds = new juggler.DataSource({
        name: 'db',
        connector: 'memory',
      });
      folderRepo = new DefaultCrudRepository(Folder, ds);
      fileRepo = new DefaultCrudRepository(File, ds);
      authorRepo = new DefaultCrudRepository(Author, ds);
      accountRepo = new DefaultCrudRepository(Account, ds);
    });

    before(() => {
      // using a variable instead of a repository property
      folderFiles = createHasManyRepositoryFactory(
        Folder.definition.relations.files as HasManyDefinition,
        async () => fileRepo,
      );
      folderAuthor = createHasOneRepositoryFactory(
        Folder.definition.relations.author as HasOneDefinition,
        async () => authorRepo,
      );
      fileFolder = createBelongsToAccessor(
        File.definition.relations.folder as BelongsToDefinition,
        async () => folderRepo,
        fileRepo,
      );
    });

    beforeEach(async () => {
      await folderRepo.deleteAll();
      await fileRepo.deleteAll();
      await authorRepo.deleteAll();
    });
    context('find* methods with inclusion', () => {
      it('implements Repository.find() with included models', async () => {
        const createdFolders = await folderRepo.createAll([
          {name: 'f1', id: 1},
          {name: 'f2', id: 2},
        ]);
        const files = await fileRepo.createAll([
          {id: 1, title: 'file1', folderId: 1},
          {id: 2, title: 'file2', folderId: 3},
        ]);

        folderRepo.registerInclusionResolver('files', hasManyResolver);

        const folders = await folderRepo.find({include: ['files']});

        expect(toJSON(folders)).to.deepEqual([
          {...createdFolders[0].toJSON(), files: [toJSON(files[0])]},
          {...createdFolders[1].toJSON(), files: []},
        ]);
      });

      it('implements Repository.find() with included models and scope limit', async () => {
        const createdFolders = await folderRepo.createAll([
          {name: 'f1', id: 1},
          {name: 'f2', id: 2},
          {name: 'f3', id: 3},
          {name: 'f4', id: 4},
        ]);
        const files = await fileRepo.createAll([
          {id: 1, title: 'file1', folderId: 1},
          {id: 2, title: 'file3.A', folderId: 3},
          {id: 3, title: 'file3.D', folderId: 3},
          {id: 4, title: 'file3.C', folderId: 3},
          {id: 5, title: 'file3.B', folderId: 3},
          {id: 6, title: 'file2.D', folderId: 2},
          {id: 7, title: 'file2.A', folderId: 2},
          {id: 8, title: 'file2.C', folderId: 2},
          {id: 9, title: 'file2.B', folderId: 2},
        ]);

        folderRepo.registerInclusionResolver(
          'files',
          folderFiles.inclusionResolver,
        );

        const folders = await folderRepo.find({
          include: [
            {relation: 'files', scope: {limit: 3, order: ['title ASC']}},
          ],
        });

        expect(toJSON(folders)).to.deepEqual([
          {...createdFolders[0].toJSON(), files: [toJSON(files[0])]},
          {
            ...createdFolders[1].toJSON(),
            files: [toJSON(files[6]), toJSON(files[8]), toJSON(files[7])],
          },
          {
            ...createdFolders[2].toJSON(),
            files: [toJSON(files[1]), toJSON(files[4]), toJSON(files[3])],
          },
          {
            ...createdFolders[3].toJSON(),
            // files: [], //? I would prefer to have files as an empty array but I think that would be a change to flattenTargetsOfOneToManyRelation?
          },
        ]);
      });

      it('implements Repository.find() with included models and scope totalLimit', async () => {
        const createdFolders = await folderRepo.createAll([
          {name: 'f1', id: 1},
          {name: 'f2', id: 2},
          {name: 'f3', id: 3},
          {name: 'f4', id: 4},
        ]);
        const files = await fileRepo.createAll([
          {id: 1, title: 'file1', folderId: 1},
          {id: 2, title: 'file3.A', folderId: 3},
          {id: 3, title: 'file3.D', folderId: 3},
          {id: 4, title: 'file3.C', folderId: 3},
          {id: 5, title: 'file3.B', folderId: 3},
          {id: 6, title: 'file2.D', folderId: 2},
          {id: 7, title: 'file2.A', folderId: 2},
          {id: 8, title: 'file2.C', folderId: 2},
          {id: 9, title: 'file2.B', folderId: 2},
        ]);

        folderRepo.registerInclusionResolver(
          'files',
          folderFiles.inclusionResolver,
        );

        const folders = await folderRepo.find({
          include: [
            {relation: 'files', scope: {totalLimit: 3, order: ['title ASC']}},
          ],
        });

        expect(toJSON(folders)).to.deepEqual([
          {...createdFolders[0].toJSON(), files: [toJSON(files[0])]},
          {
            ...createdFolders[1].toJSON(),
            files: [toJSON(files[6]), toJSON(files[8])],
          },
          {
            ...createdFolders[2].toJSON(),
            // files: [],
          },
          {
            ...createdFolders[3].toJSON(),
            // files: [], //? I would prefer to have files as an empty array but I think that would be a change to flattenTargetsOfOneToManyRelation?
          },
        ]);
      });

      it('implements Repository.findById() with included models', async () => {
        const folders = await folderRepo.createAll([
          {name: 'f1', id: 1},
          {name: 'f2', id: 2},
        ]);
        const createdFile = await fileRepo.create({
          id: 1,
          title: 'file1',
          folderId: 1,
        });

        fileRepo.registerInclusionResolver('folder', belongsToResolver);

        const file = await fileRepo.findById(1, {
          include: ['folder'],
        });

        expect(file.toJSON()).to.deepEqual({
          ...createdFile.toJSON(),
          folder: folders[0].toJSON(),
        });
      });

      it('implements Repository.findOne() with included models', async () => {
        const folders = await folderRepo.createAll([
          {name: 'f1', id: 1},
          {name: 'f2', id: 2},
        ]);
        const createdAuthor = await authorRepo.create({
          id: 1,
          name: 'a1',
          folderId: 1,
        });

        folderRepo.registerInclusionResolver('author', hasOneResolver);

        const folder = await folderRepo.findOne({
          include: ['author'],
        });

        expect(folder!.toJSON()).to.deepEqual({
          ...folders[0].toJSON(),
          author: createdAuthor.toJSON(),
        });
      });

      context(
        'throws if the target data passes to CRUD methods contains nav properties',
        () => {
          it('error message warns about the nav properties', async () => {
            // a unit test for entityToData, which is invoked by create() method
            // it would be the same of other CRUD methods.
            await expect(
              folderRepo.create({
                name: 'f1',
                files: [{title: 'nav property'}],
              }),
            ).to.be.rejectedWith(
              'Navigational properties are not allowed in model data (model "Folder" property "files"), please remove it.',
            );
          });

          it('error msg also warns about property and relation names in belongsTo relation', async () => {
            // the belongsTo relation has the same property name as the relation name.
            await expect(
              accountRepo.create({
                name: 'acoount 1',
                author: 1, // same as the relation name
              }),
            ).to.be.rejectedWith(
              'Navigational properties are not allowed in model data (model "Account" property "author"), please remove it.' +
                ' The error might be invoked by belongsTo relations, please make sure the relation name is not the same as' +
                ' the property name.',
            );
          });
        },
      );

      // stub resolvers
      const hasManyResolver: InclusionResolver<Folder, File> =
        async entities => {
          const files = [];
          for (const entity of entities) {
            const file = await folderFiles(entity.id).find();
            files.push(file);
          }

          return files;
        };

      const belongsToResolver: InclusionResolver<File, Folder> =
        async entities => {
          const folders = [];

          for (const file of entities) {
            const folder = await fileFolder(file.folderId);
            folders.push(folder);
          }

          return folders;
        };

      const hasOneResolver: InclusionResolver<Folder, Author> =
        async entities => {
          const authors = [];

          for (const folder of entities) {
            const author = await folderAuthor(folder.id).get();
            authors.push(author);
          }

          return authors;
        };
    });
  });

  it('implements Repository.delete()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({title: 't3', content: 'c3'});

    await repo.delete(note);

    const found = await repo.find({where: {id: note.id}});
    expect(found).to.be.empty();
  });

  it('implements Repository.deleteById()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({title: 't3', content: 'c3'});

    await repo.deleteById(note.id);

    const found = await repo.find({where: {id: note.id}});
    expect(found).to.be.empty();
  });

  it('throws EntityNotFoundError when deleting an unknown id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await expect(repo.deleteById(99999)).to.be.rejectedWith(
      EntityNotFoundError,
    );
  });

  it('implements Repository.deleteAll()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.create({title: 't3', content: 'c3'});
    await repo.create({title: 't4', content: 'c4'});
    const result = await repo.deleteAll({title: 't3'});
    expect(result.count).to.eql(1);
  });

  it('implements Repository.updateById()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({title: 't3', content: 'c3'});

    const id = note.id;
    const delta = {content: 'c4'};
    await repo.updateById(id, delta);

    const updated = await repo.findById(id);
    expect(updated.toJSON()).to.eql(Object.assign(note.toJSON(), delta));
  });

  it('throws EntityNotFound error when updating an unknown id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await expect(repo.updateById(9999, {title: 't4'})).to.be.rejectedWith(
      EntityNotFoundError,
    );
  });

  it('throws error when provided an empty id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await expect(repo.updateById(undefined, {title: 't4'})).to.be.rejectedWith(
      'Invalid Argument: id cannot be undefined',
    );
  });

  it('implements Repository.updateAll()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.create({title: 't3', content: 'c3'});
    await repo.create({title: 't4', content: 'c4'});
    const result = await repo.updateAll({content: 'c5'}, {});
    expect(result.count).to.eql(2);
    const notes = await repo.find({where: {title: 't3'}});
    expect(notes[0].content).to.eql('c5');
  });

  it('implements Repository.updateAll() without a where object', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.create({title: 't3', content: 'c3'});
    await repo.create({title: 't4', content: 'c4'});
    const result = await repo.updateAll({content: 'c5'});
    expect(result.count).to.eql(2);
    const notes = await repo.find();
    const titles = notes.map(n => `${n.title}:${n.content}`);
    expect(titles).to.deepEqual(['t3:c5', 't4:c5']);
  });

  it('implements Repository.count()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await repo.create({title: 't3', content: 'c3'});
    await repo.create({title: 't4', content: 'c4'});
    const result = await repo.count();
    expect(result.count).to.eql(2);
  });

  it('implements Repository.save() without id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.save(new Note({title: 't3', content: 'c3'}));
    const result = await repo.findById(note!.id);
    expect(result.toJSON()).to.eql(note!.toJSON());
  });

  it('implements Repository.save() with id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({title: 't3', content: 'c3'});
    note1.content = 'c4';
    const note = await repo.save(note1);
    const result = await repo.findById(note!.id);
    expect(result.toJSON()).to.eql(note1.toJSON());
  });

  it('implements Repository.replaceById()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note = await repo.create({title: 't3', content: 'c3'});
    await repo.replaceById(note.id, {title: 't4', content: undefined});
    const result = await repo.findById(note.id);
    expect(result.toJSON()).to.eql({
      id: note.id,
      title: 't4',
    });
  });

  it('throws EntityNotFound error when replacing an unknown id', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    await expect(repo.replaceById(9999, {title: 't4'})).to.be.rejectedWith(
      EntityNotFoundError,
    );
  });

  it('implements Repository.exists()', async () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const note1 = await repo.create({title: 't3', content: 'c3'});
    const ok = await repo.exists(note1.id);
    expect(ok).to.be.true();
  });

  describe('Repository.execute()', () => {
    beforeEach(() => {
      // Dummy implementation for execute() in datasource
      ds.execute = (...args: unknown[]) => {
        return Promise.resolve(args);
      };
    });

    it('implements SQL variant', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      const result = await repo.execute('query', ['arg']);
      expect(result).to.deepEqual(['query', ['arg']]);
    });

    it('implements MongoDB variant', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      const result = await repo.execute('MyCollection', 'aggregate', [
        {$unwind: '$data'},
        {$out: 'tempData'},
      ]);
      expect(result).to.deepEqual([
        'MyCollection',
        'aggregate',
        [{$unwind: '$data'}, {$out: 'tempData'}],
      ]);
    });

    it('implements a generic variant', async () => {
      const repo = new DefaultCrudRepository(Note, ds);
      const command = {
        query: 'MATCH (u:User {email: {email}}) RETURN u',
        params: {
          email: 'alice@example.com',
        },
      };
      const result = await repo.execute(command);
      expect(result).to.deepEqual([command]);
    });

    it(`throws error when execute() not implemented by ds connector`, async () => {
      const memDs = new juggler.DataSource({
        name: 'db',
        connector: 'memory',
      });
      delete memDs.connector!.execute;
      const repo = new DefaultCrudRepository(Note, memDs);
      await expect(repo.execute('query', [])).to.be.rejectedWith(
        'execute() must be implemented by the connector',
      );
    });
  });

  it('has the property inclusionResolvers', () => {
    const repo = new DefaultCrudRepository(Note, ds);
    expect(repo.inclusionResolvers).to.be.instanceof(Map);
  });

  it('implements Repository.registerInclusionResolver()', () => {
    const repo = new DefaultCrudRepository(Note, ds);
    const resolver: InclusionResolver<Note, Entity> = async entities => {
      return entities;
    };
    repo.registerInclusionResolver('notes', resolver);
    const setResolver = repo.inclusionResolvers.get('notes');
    expect(setResolver).to.eql(resolver);
  });
});

describe('DefaultTransactionalRepository', () => {
  let ds: juggler.DataSource;
  class Note extends Entity {
    static definition = new ModelDefinition({
      name: 'Note',
      properties: {
        title: 'string',
        content: 'string',
        id: {name: 'id', type: 'number', id: true},
      },
    });

    title?: string;
    content?: string;
    id: number;

    constructor(data: Partial<Note>) {
      super(data);
    }
  }

  beforeEach(() => {
    ds = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
  });

  it('throws an error when beginTransaction() not implemented', async () => {
    const repo = new DefaultTransactionalRepository(Note, ds);
    await expect(repo.beginTransaction({})).to.be.rejectedWith(
      'beginTransaction must be function implemented by the connector',
    );
  });
  it('calls connector beginTransaction() when available', async () => {
    const crudDs = new juggler.DataSource({
      name: 'db',
      connector: CrudConnectorStub,
    });

    const repo = new DefaultTransactionalRepository(Note, crudDs);
    const res = await repo.beginTransaction();
    expect(res).to.be.instanceOf(TransactionClass);
  });
});
