// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {juggler, RepositoryMixin, Class, Repository} from '../../../';
import {Application, Component} from '@loopback/core';

// tslint:disable:no-any

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

  it('mixed class has .getRepository()', () => {
    const myApp = new AppWithRepoMixin();
    expect(typeof myApp.getRepository).to.eql('function');
  });

  it('gets repository instance from app.getRepository()', async () => {
    const myApp = new AppWithRepoMixin();
    myApp
      .bind('repositories.NoteRepo')
      .toClass(NoteRepo)
      .tag('repository');

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

    myApp.dataSource(FooDataSource);
    expectDataSourceToBeBound(myApp, FooDataSource, 'foo');
  });

  it('binds dataSource class using the given name', () => {
    const myApp = new AppWithRepoMixin();
    myApp.dataSource(FooDataSource, 'bar');
    expectDataSourceToBeBound(myApp, FooDataSource, 'bar');
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
