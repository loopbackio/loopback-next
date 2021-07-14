// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, BindingScope, Component, injectable} from '@loopback/core';
import {expect, sinon} from '@loopback/testlab';
import {
  Class,
  DataSource,
  DefaultCrudRepository,
  Entity,
  juggler,
  Model,
  ModelDefinition,
  Repository,
  RepositoryMixin,
} from '../../..';
import {model, property} from '../../../decorators';

describe('RepositoryMixin', () => {
  it('mixed class has .repository()', () => {
    const myApp = new AppWithRepoMixin();
    expect(typeof myApp.repository).to.be.eql('function');
  });

  it('binds repository from app.repository()', () => {
    const myApp = new AppWithRepoMixin();

    expectNoteRepoToNotBeBound(myApp);
    myApp.repository(NoteRepo);
    expectNoteRepoToBeBound(myApp);
  });

  it('binds singleton repository from app.repository()', () => {
    @injectable({scope: BindingScope.SINGLETON})
    class SingletonNoteRepo extends NoteRepo {}

    const myApp = new AppWithRepoMixin();

    const binding = myApp.repository(SingletonNoteRepo);
    expect(binding.scope).to.equal(BindingScope.SINGLETON);
  });

  it('mixed class has .getRepository()', () => {
    const myApp = new AppWithRepoMixin();
    expect(typeof myApp.getRepository).to.eql('function');
  });

  it('gets repository instance from app.getRepository()', async () => {
    const myApp = new AppWithRepoMixin();
    myApp.bind('repositories.NoteRepo').toClass(NoteRepo).tag('repository');

    const repoInstance = await myApp.getRepository(NoteRepo);

    expect(repoInstance).to.be.instanceOf(NoteRepo);
  });

  it('binds user defined component without repository', () => {
    class EmptyTestComponent {}

    const myApp = new AppWithRepoMixin();
    myApp.component(EmptyTestComponent);

    expectComponentToBeBound(myApp, EmptyTestComponent);
  });

  it('binds user defined component with repository from .component()', () => {
    const myApp = new AppWithRepoMixin();

    const boundComponentsBefore = myApp.find('components.*').map(b => b.key);
    expect(boundComponentsBefore).to.be.empty();
    expectNoteRepoToNotBeBound(myApp);

    myApp.component(TestComponent);

    expectComponentToBeBound(myApp, TestComponent);
    expectNoteRepoToBeBound(myApp);
  });

  it('binds user defined component with models', () => {
    @model()
    class MyModel extends Model {}

    class MyModelComponent {
      models = [MyModel];
    }

    const myApp = new AppWithRepoMixin();
    myApp.component(MyModelComponent);

    const boundModels = myApp.find('models.*').map(b => b.key);
    expect(boundModels).to.containEql('models.MyModel');
    const modelCtor = myApp.getSync<typeof MyModel>('models.MyModel');
    expect(modelCtor).to.be.equal(MyModel);
  });

  context('migrateSchema', () => {
    let app: AppWithRepoMixin;
    let migrateStub: sinon.SinonStub;
    let updateStub: sinon.SinonStub;
    let DataSourceStub: typeof juggler.DataSource;

    beforeEach(setupTestHelpers);

    it('is a method provided by the mixin', () => {
      expect(typeof app.migrateSchema).to.be.eql('function');
    });

    it('calls autoupdate on registered datasources', async () => {
      app.dataSource(DataSourceStub);

      await app.migrateSchema({existingSchema: 'alter'});

      sinon.assert.called(updateStub);
      sinon.assert.notCalled(migrateStub);
    });

    it('calls automigrate on registered datasources', async () => {
      app.dataSource(DataSourceStub);

      await app.migrateSchema({existingSchema: 'drop'});

      sinon.assert.called(migrateStub);
      sinon.assert.notCalled(updateStub);
    });

    it('skips datasources not implementing schema migrations', async () => {
      class OtherDataSource implements DataSource {
        name = 'other';
        connector = undefined;
        settings = {};
      }

      // Bypass app.dataSource type checks and bind a custom datasource class
      app
        .bind('datasources.other')
        .toClass(OtherDataSource)
        .tag('datasource')
        .inScope(BindingScope.SINGLETON);

      await app.migrateSchema({existingSchema: 'drop'});
      // the test passes when migrateSchema() does not throw any error
    });

    it('skips datasources that disables migration', async () => {
      let modelsMigrated = ['no models were migrated'];

      const ds = new juggler.DataSource({
        name: 'db',
        connector: 'memory',
        disableMigration: true,
      });
      // FIXME(bajtos) typings for connectors are missing autoupdate/autoupgrade
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ds.connector as any).automigrate = function (
        models: string[],
        cb: Function,
      ) {
        modelsMigrated = models;
        cb();
      };
      app.dataSource(ds);

      class Product extends Entity {
        static definition = new ModelDefinition('Product').addProperty('id', {
          type: 'number',
          id: true,
        });
      }
      class ProductRepository extends DefaultCrudRepository<Product, number> {
        constructor() {
          super(Product, ds);
        }
      }
      app.repository(ProductRepository);

      await app.migrateSchema({existingSchema: 'drop'});

      expect(modelsMigrated).to.eql(['no models were migrated']);
    });

    it('attaches all models to datasources', async () => {
      let modelsMigrated = ['no models were migrated'];

      const ds = new juggler.DataSource({name: 'db', connector: 'memory'});
      // FIXME(bajtos) typings for connectors are missing autoupdate/autoupgrade
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ds.connector as any).automigrate = function (
        models: string[],
        cb: Function,
      ) {
        modelsMigrated = models;
        cb();
      };
      app.dataSource(ds);

      class Product extends Entity {
        static definition = new ModelDefinition('Product').addProperty('id', {
          type: 'number',
          id: true,
        });
      }
      class ProductRepository extends DefaultCrudRepository<Product, number> {
        constructor() {
          super(Product, ds);
        }
      }
      app.repository(ProductRepository);

      await app.migrateSchema({existingSchema: 'drop'});

      expect(modelsMigrated).to.eql(['Product']);
    });

    it('migrates selected models only', async () => {
      app.dataSource(DataSourceStub);

      await app.migrateSchema({existingSchema: 'drop', models: ['Category']});

      sinon.assert.calledWith(migrateStub, ['Category']);
      sinon.assert.notCalled(updateStub);
    });

    function setupTestHelpers() {
      app = new AppWithRepoMixin();

      migrateStub = sinon.stub().resolves();
      updateStub = sinon.stub().resolves();

      DataSourceStub = class extends juggler.DataSource {
        automigrate(models: string | string[]): Promise<void> {
          return migrateStub(models);
        }

        autoupdate(models: string | string[]): Promise<void> {
          return updateStub(models);
        }
      };
    }
  });

  class AppWithRepoMixin extends RepositoryMixin(Application) {}

  class NoteRepo implements Repository<juggler.PersistedModel> {
    model: juggler.PersistedModelClass;

    constructor() {
      const ds: juggler.DataSource = new juggler.DataSource({
        name: 'db',
        connector: 'memory',
      });

      this.model = ds.createModel(
        'note',
        {title: 'string', content: 'string'},
        {},
      );
    }
  }

  class TestComponent {
    repositories = [NoteRepo];
  }

  function expectNoteRepoToBeBound(myApp: Application) {
    const boundRepositories = myApp.find('repositories.*').map(b => b.key);
    expect(boundRepositories).to.containEql('repositories.NoteRepo');
    const binding = myApp.getBinding('repositories.NoteRepo');
    expect(binding.scope).to.equal(BindingScope.TRANSIENT);
    expect(binding.tagMap).to.have.property('repository');
    const repoInstance = myApp.getSync('repositories.NoteRepo');
    expect(repoInstance).to.be.instanceOf(NoteRepo);
  }

  function expectNoteRepoToNotBeBound(myApp: Application) {
    const boundRepos = myApp.find('repositories.*').map(b => b.key);
    expect(boundRepos).to.be.empty();
  }

  function expectComponentToBeBound(
    myApp: Application,
    component: Class<Component>,
  ) {
    const boundComponents = myApp.find('components.*').map(b => b.key);
    expect(boundComponents).to.containEql(`components.${component.name}`);
    const componentInstance = myApp.getSync(`components.${component.name}`);
    expect(componentInstance).to.be.instanceOf(component);
  }
});

describe('RepositoryMixin dataSource', () => {
  it('mixes into the target class', () => {
    const myApp = new AppWithRepoMixin();
    expect(typeof myApp.dataSource).to.be.eql('function');
  });

  it('does not conflict with previous binding keys', () => {
    const myApp = new AppWithRepoMixin();
    const withoutDataSource = myApp.find('datasources.*');
    expect(withoutDataSource).to.be.empty();
  });

  it('binds dataSource class using the dataSourceName property', () => {
    const myApp = new AppWithRepoMixin();

    const binding = myApp.dataSource(FooDataSource);
    expect(binding.tagMap).to.have.property('datasource');
    expectDataSourceToBeBound(myApp, FooDataSource, 'foo');
  });

  it('binds dataSource class using the given name', () => {
    const myApp = new AppWithRepoMixin();
    myApp.dataSource(FooDataSource, 'bar');
    expectDataSourceToBeBound(myApp, FooDataSource, 'bar');
  });

  it('binds dataSource class using options', () => {
    const myApp = new AppWithRepoMixin();
    const binding = myApp.dataSource(FooDataSource, {
      name: 'bar',
      namespace: 'my-datasources',
    });
    expect(binding.key).to.eql('my-datasources.bar');
  });

  it('binds dataSource class using Class name', () => {
    const myApp = new AppWithRepoMixin();
    myApp.dataSource(BarDataSource);
    expectDataSourceToBeBound(myApp, BarDataSource, 'BarDataSource');
  });

  it('binds dataSource class instance using dataSourceName property', () => {
    const myApp = new AppWithRepoMixin();
    myApp.dataSource(new FooDataSource());
    expectDataSourceToBeBound(myApp, FooDataSource, 'foo');
  });

  it('binds dataSource class instance using custom name', () => {
    const myApp = new AppWithRepoMixin();
    myApp.dataSource(new FooDataSource(), 'bar');
    expectDataSourceToBeBound(myApp, FooDataSource, 'bar');
  });

  const expectDataSourceToBeBound = (
    app: AppWithRepoMixin,
    ds: Class<juggler.DataSource>,
    name: string,
  ) => {
    expect(app.find('datasources.*').map(d => d.key)).to.containEql(
      `datasources.${name}`,
    );
    expect(app.findByTag('datasource').map(d => d.key)).to.containEql(
      `datasources.${name}`,
    );
    expect(app.getSync(`datasources.${name}`)).to.be.instanceOf(ds);
  };

  class AppWithRepoMixin extends RepositoryMixin(Application) {}

  class FooDataSource extends juggler.DataSource {
    static dataSourceName = 'foo';
    constructor() {
      super({
        name: 'foo',
        connector: 'memory',
      });
    }
  }

  class BarDataSource extends juggler.DataSource {
    constructor() {
      super({
        name: 'foo',
        connector: 'memory',
      });
    }
  }
});

describe('RepositoryMixin model', () => {
  it('mixes into the target class', () => {
    const myApp = new AppWithRepoMixin();
    expect(typeof myApp.model).to.be.eql('function');
  });

  it('binds a model class', () => {
    const myApp = new AppWithRepoMixin();
    const binding = myApp.model(MyModel);
    expect(binding.key).to.eql('models.MyModel');
    expect(binding.tagMap).to.have.property('model');
    expect(myApp.getSync('models.MyModel')).to.eql(MyModel);
  });

  @model()
  class MyModel {
    @property()
    name: string;
  }

  class AppWithRepoMixin extends RepositoryMixin(Application) {}
});
