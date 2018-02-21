// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-getting-started
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {TodoRepository} from './repositories';
import {db} from './datasources/db.datasource';

/* tslint:disable:no-unused-variable */
// Do not remove!
// Class and Repository imports required to infer types in consuming code!
// Binding and Booter imports are required to infer types for BootMixin!
import {BootMixin, Booter, Binding} from '@loopback/boot';
import {
  Class,
  Repository,
  DataSourceConstructor,
  RepositoryMixin,
} from '@loopback/repository';
/* tslint:enable:no-unused-variable */

export class TodoApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;
    this.setupRepositories();
  }

  // Helper functions (just to keep things organized)
  setupRepositories() {
    // TODO(bajtos) Automate datasource and repo registration via @loopback/boot
    // See https://github.com/strongloop/loopback-next/issues/441
    const datasource =
      this.options && this.options.datasource
        ? new DataSourceConstructor(this.options.datasource)
        : db;
    // TODO(bajtos) use app.dataSource() from @loopback/repository mixin
    // (app.dataSource() is not implemented there yet)
    // See https://github.com/strongloop/loopback-next/issues/743
    this.bind('datasource').to(datasource);
    this.repository(TodoRepository);
  }
}
