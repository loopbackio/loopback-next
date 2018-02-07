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
