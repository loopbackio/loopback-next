// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from '../common-types';
import {Repository} from '../repositories/repository';
import {juggler} from '../repositories/legacy-juggler-bridge';
import {Application} from '@loopback/core';
import {BindingScope} from '@loopback/context';

/**
 * A mixin class for Application that creates a .repository()
 * function to register a repository automatically. Also overrides
 * component function to allow it to register repositories automatically.
 *
 * ```ts
 *
 * class MyApplication extends RepositoryMixin(Application) {}
 * ```
 *
 * Please note: the members in the mixin function are documented in a dummy class
 * called <a href="#RepositoryMixinDoc">RepositoryMixinDoc</a>
 *
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
     *     const ds: juggler.DataSource = new juggler.DataSource({
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
     * Retrieve the repository instance from the given Repository class
     *
     * @param repo The repository class to retrieve the instance of
     */
    // tslint:disable-next-line:no-any
    async getRepository<R extends Repository<any>>(repo: Class<R>): Promise<R> {
      return await this.get(`repositories.${repo.name}`);
    }

    /**
     * Add the dataSource to this application.
     *
     * @param dataSource The dataSource to add.
     * @param name The binding name of the datasource; defaults to dataSource.name
     *
     * ```ts
     *
     * const ds: juggler.DataSource = new juggler.DataSource({
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
    dataSource(
      dataSource: Class<juggler.DataSource> | juggler.DataSource,
      name?: string,
    ) {
      // We have an instance of
      if (dataSource instanceof juggler.DataSource) {
        const key = `datasources.${name || dataSource.name}`;
        this.bind(key)
          .to(dataSource)
          .tag('datasource');
      } else if (typeof dataSource === 'function') {
        const key = `datasources.${name ||
          dataSource.dataSourceName ||
          dataSource.name}`;
        this.bind(key)
          .toClass(dataSource)
          .tag('datasource')
          .inScope(BindingScope.SINGLETON);
      } else {
        throw new Error('not a valid DataSource.');
      }
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
      this.mountComponentRepositories(component);
    }

    /**
     * Get an instance of a component and mount all it's
     * repositories. This function is intended to be used internally
     * by component()
     *
     * @param component The component to mount repositories of
     */
    mountComponentRepositories(component: Class<{}>) {
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
export interface ApplicationWithRepositories extends Application {
  // tslint:disable-next-line:no-any
  repository(repo: Class<any>): void;
  // tslint:disable-next-line:no-any
  getRepository<R extends Repository<any>>(repo: Class<R>): Promise<R>;
  dataSource(
    dataSource: Class<juggler.DataSource> | juggler.DataSource,
    name?: string,
  ): void;
  component(component: Class<{}>): void;
  mountComponentRepositories(component: Class<{}>): void;
}

/**
 * A dummy class created to generate the tsdoc for the members in repository
 * mixin. Please don't use it.
 *
 * The members are implemented in function
 * <a href="#RepositoryMixin">RepositoryMixin</a>
 */
export class RepositoryMixinDoc {
  // tslint:disable-next-line:no-any
  constructor(...args: any[]) {
    throw new Error(
      'This is a dummy class created for apidoc!' + 'Please do not use it!',
    );
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
   *     const ds: juggler.DataSource = new juggler.DataSource({
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
  repository(repo: Class<Repository<any>>): void {}

  /**
   * Retrieve the repository instance from the given Repository class
   *
   * @param repo The repository class to retrieve the instance of
   */
  // tslint:disable-next-line:no-any
  async getRepository<R extends Repository<any>>(repo: Class<R>): Promise<R> {
    return new repo() as R;
  }

  /**
   * Add the dataSource to this application.
   *
   * @param dataSource The dataSource to add.
   * @param name The binding name of the datasource; defaults to dataSource.name
   *
   * ```ts
   *
   * const ds: juggler.DataSource = new juggler.DataSource({
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
  dataSource(
    dataSource: Class<juggler.DataSource> | juggler.DataSource,
    name?: string,
  ) {}

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
  public component(component: Class<{}>) {}

  /**
   * Get an instance of a component and mount all it's
   * repositories. This function is intended to be used internally
   * by component()
   *
   * @param component The component to mount repositories of
   */
  mountComponentRepository(component: Class<{}>) {}
}
