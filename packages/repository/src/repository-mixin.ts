// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from './common-types';
import {Repository} from './repository';
import {juggler} from './loopback-datasource-juggler';
import {Application} from '@loopback/core';

/**
 * A mixin class for Application that creates a .repository()
 * function to register a repository automatically. Also overrides
 * component function to allow it to register repositories automatically.
 *
 * ```ts
 *
 * class MyApplication extends RepositoryMixin(Application) {}
 * ```
 */
// tslint:disable-next-line:no-any
export function RepositoryMixin<T extends Class<any>>(superClass: T) {
  return class extends superClass {
    // A mixin class has to take in a type any[] argument!
    // tslint:disable-next-line:no-any
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Add a repository to this application.
     *
     * @param repo The repository to add.
     *
     * ```ts
     *
     * class NoteRepo {
     *   model: any;
     *
     *   constructor() {
     *     const ds: juggler.DataSource = new DataSourceConstructor({
     *       name: 'db',
     *       connector: 'memory',
     *     });
     *
     *     this.model = ds.createModel(
     *       'note',
     *       {title: 'string', content: 'string'},
     *       {}
     *     );
     *   }
     * };
     *
     * app.repository(NoteRepo);
     * ```
     */
    // tslint:disable-next-line:no-any
    repository(repo: Class<Repository<any>>): void {
      const repoKey = `repositories.${repo.name}`;
      this.bind(repoKey)
        .toClass(repo)
        .tag('repository');
    }

    /**
     * Add the dataSource to this application.
     *
     * @param dataSource The dataSource to add.
     * @param name The binding name of the datasource; defaults to dataSource.name
     *
     * ```ts
     *
     * const ds: juggler.DataSource = new DataSourceConstructor({
     *   name: 'db',
     *   connector: 'memory',
     * });
     *
     * app.dataSource(ds);
     *
     * // The datasource can be injected with
     * constructor(@inject('datasources.db') protected datasource: DataSourceType) {
     *
     * }
     * ```
     */
    dataSource(dataSource: juggler.DataSource, name?: string) {
      const dataSourceKey = `datasources.${name || dataSource.name}`;
      this.bind(dataSourceKey).to(dataSource);
    }

    /**
     * Add a component to this application. Also mounts
     * all the components repositories.
     *
     * @param component The component to add.
     *
     * ```ts
     *
     * export class ProductComponent {
     *   controllers = [ProductController];
     *   repositories = [ProductRepo, UserRepo];
     *   providers = {
     *     [AUTHENTICATION_STRATEGY]: AuthStrategy,
     *     [AUTHORIZATION_ROLE]: Role,
     *   };
     * };
     *
     * app.component(ProductComponent);
     * ```
     */
    public component(component: Class<{}>) {
      super.component(component);
      this.mountComponentRepository(component);
    }

    /**
     * Get an instance of a component and mount all it's
     * repositories. This function is intended to be used internally
     * by component()
     *
     * @param component The component to mount repositories of
     */
    mountComponentRepository(component: Class<{}>) {
      const componentKey = `components.${component.name}`;
      const compInstance = this.getSync(componentKey);

      if (compInstance.repositories) {
        for (const repo of compInstance.repositories) {
          this.repository(repo);
        }
      }
    }
  };
}

/**
 * Interface for an Application mixed in with RepositoryMixin
 */
export interface AppWithRepository extends Application {
  // tslint:disable-next-line:no-any
  repository(repo: Class<any>): void;
  mountComponentRepository(component: Class<{}>): void;
}
