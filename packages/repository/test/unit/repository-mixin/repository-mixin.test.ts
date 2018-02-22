// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  RepositoryMixin,
  juggler,
  DataSourceConstructor,
  Class,
  Options,
  Repository,
  AnyObject,
  Command,
  NamedParameters,
  PositionalParameters,
} from '../../../';
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
    model: typeof juggler.PersistedModel;

    constructor() {
      const ds: juggler.DataSource = new DataSourceConstructor({
        name: 'db',
        connector: 'memory',
      });

      this.model = ds.createModel(
        'note',
        {title: 'string', content: 'string'},
        {},
      );
    }

    async execute(
      query: Command,
      // tslint:disable:no-any
      parameters: NamedParameters | PositionalParameters,
      options?: Options,
    ): Promise<AnyObject> {
      /* istanbul ignore next */
      throw Error('Not implemented');
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

  it('binds dataSource to a binding key using the dataSource name property', () => {
    const myApp = new AppWithRepoMixin();
    const fooDataSource: juggler.DataSource = new DataSourceConstructor({
      name: 'foo',
      connector: 'memory',
    });
    myApp.dataSource(fooDataSource);
    expectDataSourceToBeBound(myApp, fooDataSource, 'foo');
  });

  it('binds dataSource to a binding key using the given name', () => {
    const myApp = new AppWithRepoMixin();
    const barDataSource: juggler.DataSource = new DataSourceConstructor({
      connector: 'memory',
    });
    myApp.dataSource(barDataSource, 'bar');
    expectDataSourceToBeBound(myApp, barDataSource, 'bar');
  });

  const expectDataSourceToBeBound = (
    app: AppWithRepoMixin,
    ds: juggler.DataSource,
    name: string,
  ) => {
    expect(app.find('datasources.*').map(d => d.key)).to.containEql(
      `datasources.${name}`,
    );
    expect(app.getSync(`datasources.${name}`)).to.be.eql(ds);
  };

  class AppWithRepoMixin extends RepositoryMixin(Application) {}
});
