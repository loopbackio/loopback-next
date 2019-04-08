// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, Binding} from '@loopback/context';
import {Application} from '@loopback/core';
import * as debugFactory from 'debug';
import {Class} from '../common-types';
import {juggler, Repository} from '../repositories';
import {SchemaMigrationOptions} from '../datasource';

const debug = debugFactory('loopback:repository:mixin');

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
     * constructor(@inject('datasources.db') dataSource: DataSourceType) {
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

    /**
     * Update or recreate the database schema for all repositories.
     *
     * **WARNING**: By default, `migrateSchema()` will attempt to preserve data
     * while updating the schema in your target database, but this is not
     * guaranteed to be safe.
     *
     * Please check the documentation for your specific connector(s) for
     * a detailed breakdown of behaviors for automigrate!
     *
     * @param options Migration options, e.g. whether to update tables
     * preserving data or rebuild everything from scratch.
     */
    async migrateSchema(options: SchemaMigrationOptions = {}): Promise<void> {
      const operation =
        options.existingSchema === 'drop' ? 'automigrate' : 'autoupdate';

      // Instantiate all repositories to ensure models are registered & attached
      // to their datasources
      const repoBindings: Readonly<Binding<unknown>>[] = this.findByTag(
        'repository',
      );
      await Promise.all(repoBindings.map(b => this.get(b.key)));

      // Look up all datasources and update/migrate schemas one by one
      const dsBindings: Readonly<Binding<object>>[] = this.findByTag(
        'datasource',
      );
      for (const b of dsBindings) {
        const ds = await this.get(b.key);

        if (operation in ds && typeof ds[operation] === 'function') {
          debug('Migrating dataSource %s', b.key);
          await ds[operation](options.models);
        } else {
          debug('Skipping migration of dataSource %s', b.key);
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
  migrateSchema(options?: SchemaMigrationOptions): Promise<void>;
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
   * constructor(@inject('datasources.db') dataSource: DataSourceType) {
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

  /**
   * Update or recreate the database schema for all repositories.
   *
   * **WARNING**: By default, `migrateSchema()` will attempt to preserve data
   * while updating the schema in your target database, but this is not
   * guaranteed to be safe.
   *
   * Please check the documentation for your specific connector(s) for
   * a detailed breakdown of behaviors for automigrate!
   *
   * @param options Migration options, e.g. whether to update tables
   * preserving data or rebuild everything from scratch.
   */
  async migrateSchema(options?: SchemaMigrationOptions): Promise<void> {}
}
