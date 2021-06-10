// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  BindingFromClassOptions,
  BindingScope,
  Component,
  Constructor,
  CoreBindings,
  createBindingFromClass,
  MixinTarget,
} from '@loopback/core';
import debugFactory from 'debug';
import {Class} from '../common-types';
import {SchemaMigrationOptions} from '../datasource';
import {RepositoryBindings, RepositoryTags} from '../keys';
import {Model} from '../model';
import {juggler, Repository} from '../repositories';

const debug = debugFactory('loopback:repository:mixin');

// FIXME(rfeng): Workaround for https://github.com/microsoft/rushstack/pull/1867
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as loopbackContext from '@loopback/core';
import * as loopbackCore from '@loopback/core';

/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * A mixin class for Application that creates a .repository()
 * function to register a repository automatically. Also overrides
 * component function to allow it to register repositories automatically.
 *
 * @example
 * ```ts
 * class MyApplication extends RepositoryMixin(Application) {}
 * ```
 *
 * Please note: the members in the mixin function are documented in a dummy class
 * called <a href="#RepositoryMixinDoc">RepositoryMixinDoc</a>
 *
 * @param superClass - Application class
 * @returns A new class that extends the super class with repository related
 * methods
 *
 * @typeParam T - Type of the application class as the target for the mixin
 *
 */
export function RepositoryMixin<T extends MixinTarget<Application>>(
  superClass: T,
) {
  return class extends superClass {
    /**
     * Add a repository to this application.
     *
     * @param repoClass - The repository to add.
     * @param nameOrOptions - Name or options for the binding
     *
     * @example
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repository<R extends Repository<any>>(
      repoClass: Class<R>,
      nameOrOptions?: string | BindingFromClassOptions,
    ): Binding<R> {
      const binding = createBindingFromClass(repoClass, {
        namespace: RepositoryBindings.REPOSITORIES,
        type: RepositoryTags.REPOSITORY,
        defaultScope: BindingScope.TRANSIENT,
        ...toOptions(nameOrOptions),
      }).tag(RepositoryTags.REPOSITORY);
      this.add(binding);
      return binding;
    }

    /**
     * Retrieve the repository instance from the given Repository class
     *
     * @param repo - The repository class to retrieve the instance of
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getRepository<R extends Repository<any>>(repo: Class<R>): Promise<R> {
      return this.get(`repositories.${repo.name}`);
    }

    /**
     * Add the dataSource to this application.
     *
     * @param dataSource - The dataSource to add.
     * @param nameOrOptions - The binding name or options of the datasource;
     * defaults to dataSource.name
     *
     * @example
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
    dataSource<D extends juggler.DataSource>(
      dataSource: Class<D> | D,
      nameOrOptions?: string | BindingFromClassOptions,
    ): Binding<D> {
      const options = toOptions(nameOrOptions);
      // We have an instance of
      if (dataSource instanceof juggler.DataSource) {
        const name = options.name || dataSource.name;
        const namespace = options.namespace ?? RepositoryBindings.DATASOURCES;
        const key = `${namespace}.${name}`;
        return this.bind(key).to(dataSource).tag(RepositoryTags.DATASOURCE);
      } else if (typeof dataSource === 'function') {
        options.name = options.name || dataSource.dataSourceName;
        const binding = createBindingFromClass(dataSource, {
          namespace: RepositoryBindings.DATASOURCES,
          type: RepositoryTags.DATASOURCE,
          defaultScope: BindingScope.SINGLETON,
          ...options,
        });
        this.add(binding);
        return binding;
      } else {
        throw new Error('not a valid DataSource.');
      }
    }

    /**
     * Register a model class as a binding in the target context
     * @param modelClass - Model class
     */
    model<M extends Class<unknown>>(modelClass: M) {
      const binding = createModelClassBinding(modelClass);
      this.add(binding);
      return binding;
    }

    /**
     * Add a component to this application. Also mounts
     * all the components repositories.
     *
     * @param component - The component to add.
     * @param nameOrOptions - Name or options for the binding.
     *
     * @example
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
    // Unfortunately, TypeScript does not allow overriding methods inherited
    // from mapped types. https://github.com/microsoft/TypeScript/issues/38496
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    public component<C extends Component = Component>(
      componentCtor: Constructor<C>,
      nameOrOptions?: string | BindingFromClassOptions,
    ) {
      const binding = super.component(componentCtor, nameOrOptions);
      const instance = this.getSync<C & RepositoryComponent>(binding.key);
      this.mountComponentRepositories(instance);
      this.mountComponentModels(instance);
      return binding;
    }

    /**
     * Get an instance of a component and mount all it's
     * repositories. This function is intended to be used internally
     * by `component()`.
     *
     * NOTE: Calling `mountComponentRepositories` with a component class
     * constructor is deprecated. You should instantiate the component
     * yourself and provide the component instance instead.
     *
     * @param componentInstanceOrClass - The component to mount repositories of
     * @internal
     */
    mountComponentRepositories(
      // accept also component class to preserve backwards compatibility
      // TODO(semver-major) Remove support for component class constructor
      componentInstanceOrClass: Class<unknown> | RepositoryComponent,
    ) {
      const component = resolveComponentInstance(this);

      if (component.repositories) {
        for (const repo of component.repositories) {
          this.repository(repo);
        }
      }

      // `Readonly<Application>` is a hack to remove protected members
      // and thus allow `this` to be passed as a value for `ctx`
      function resolveComponentInstance(ctx: Readonly<Application>) {
        if (typeof componentInstanceOrClass !== 'function')
          return componentInstanceOrClass;

        const componentName = componentInstanceOrClass.name;
        const componentKey = `${CoreBindings.COMPONENTS}.${componentName}`;
        return ctx.getSync<RepositoryComponent>(componentKey);
      }
    }

    /**
     * Bind all model classes provided by a component.
     * @param component
     * @internal
     */
    mountComponentModels(component: RepositoryComponent) {
      if (!component.models) return;
      for (const m of component.models) {
        this.model(m);
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
     * @param options - Migration options, e.g. whether to update tables
     * preserving data or rebuild everything from scratch.
     */
    async migrateSchema(options: SchemaMigrationOptions = {}): Promise<void> {
      const operation =
        options.existingSchema === 'drop' ? 'automigrate' : 'autoupdate';

      // Instantiate all repositories to ensure models are registered & attached
      // to their datasources
      const repoBindings: Readonly<Binding<unknown>>[] =
        this.findByTag('repository');
      await Promise.all(repoBindings.map(b => this.get(b.key)));

      // Look up all datasources and update/migrate schemas one by one
      const dsBindings: Readonly<Binding<object>>[] = this.findByTag(
        RepositoryTags.DATASOURCE,
      );
      for (const b of dsBindings) {
        const ds = await this.get<juggler.DataSource>(b.key);
        const disableMigration = ds.settings.disableMigration ?? false;

        if (
          operation in ds &&
          typeof ds[operation] === 'function' &&
          !disableMigration
        ) {
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
 * This interface describes additional Component properties
 * allowing components to contribute Repository-related artifacts.
 */
export interface RepositoryComponent {
  /**
   * An optional list of Repository classes to bind for dependency injection
   * via `app.repository()` API.
   */
  repositories?: Class<Repository<Model>>[];

  /**
   * An optional list of Model classes to bind for dependency injection
   * via `app.model()` API.
   */
  models?: Class<Model>[];
}

/**
 * Normalize name or options to `BindingFromClassOptions`
 * @param nameOrOptions - Name or options for binding from class
 */
function toOptions(nameOrOptions?: string | BindingFromClassOptions) {
  if (typeof nameOrOptions === 'string') {
    return {name: nameOrOptions};
  }
  return nameOrOptions ?? {};
}

/**
 * Interface for an Application mixed in with RepositoryMixin
 */
export interface ApplicationWithRepositories extends Application {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  repository<R extends Repository<any>>(
    repo: Class<R>,
    name?: string,
  ): Binding<R>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRepository<R extends Repository<any>>(repo: Class<R>): Promise<R>;
  dataSource<D extends juggler.DataSource>(
    dataSource: Class<D> | D,
    name?: string,
  ): Binding<D>;
  model<M extends Class<unknown>>(modelClass: M): Binding<M>;
  component(component: Class<unknown>, name?: string): Binding;
  mountComponentRepositories(component: Class<unknown>): void;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    throw new Error(
      'This is a dummy class created for apidoc!' + 'Please do not use it!',
    );
  }

  /**
   * Add a repository to this application.
   *
   * @param repo - The repository to add.
   *
   * @example
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  repository(repo: Class<Repository<any>>): Binding {
    throw new Error();
  }

  /**
   * Retrieve the repository instance from the given Repository class
   *
   * @param repo - The repository class to retrieve the instance of
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getRepository<R extends Repository<any>>(repo: Class<R>): Promise<R> {
    return new repo() as R;
  }

  /**
   * Add the dataSource to this application.
   *
   * @param dataSource - The dataSource to add.
   * @param name - The binding name of the datasource; defaults to dataSource.name
   *
   * @example
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
  ): Binding {
    throw new Error();
  }

  /**
   * Add a component to this application. Also mounts
   * all the components repositories.
   *
   * @param component - The component to add.
   *
   * @example
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
  public component(component: Class<{}>): Binding {
    throw new Error();
  }

  /**
   * Get an instance of a component and mount all it's
   * repositories. This function is intended to be used internally
   * by component()
   *
   * @param component - The component to mount repositories of
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
   * @param options - Migration options, e.g. whether to update tables
   * preserving data or rebuild everything from scratch.
   */
  async migrateSchema(options?: SchemaMigrationOptions): Promise<void> {}
}

/**
 * Create a binding for the given model class
 * @param modelClass - Model class
 */
export function createModelClassBinding<M extends Class<unknown>>(
  modelClass: M,
) {
  return Binding.bind<M>(`${RepositoryBindings.MODELS}.${modelClass.name}`)
    .to(modelClass)
    .tag(RepositoryTags.MODEL);
}
