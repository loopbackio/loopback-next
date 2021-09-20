// Copyright The LoopBack Authors 2021. All Rights Reserved.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  BindingCreationPolicy,
  BindingScope,
  BindingType,
  Component,
  config,
  configBindingKeyFor,
  ContextView,
  CoreBindings,
  extensionFilter,
  extensionPoint,
  extensions,
  inject,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import type {WinstonLogger} from '@loopback/logging';
import type {
  Prisma as PrismaType,
  PrismaClient as PrismaClientType,
} from '@prisma/client';
import {
  PrismaClientConfigConflictError,
  PrismaClientInstanceUnsupportedBindingScopeError,
  PrismaClientInstanceUnsupportedBindingTypeError,
} from '.';
import {
  PrismaMiddlewareUnsupportedBindingScopeError,
  PrismaMiddlewareUnsupportedBindingTypeError,
} from './errors';
import {createBindingFromPrismaModelName} from './helpers/';
import {PrismaBindings} from './keys';
import {DEFAULT_PRISMA_OPTIONS, PrismaOptions} from './types';

let PrismaClient: typeof PrismaClientType;
let Prisma: typeof PrismaType;
// Try to import from outer `node_mdoules` first.
// This is necessary as this package's tests generate its own `PrismaClient`,
// which will interfere with `@loopback/example-prisma` tests.
try {
  const prismaPkg = require('../../@prisma/client');
  PrismaClient = prismaPkg.PrismaClient;
  Prisma = prismaPkg.Prisma;
} catch {
  const prismaPkg = require('@prisma/client');
  PrismaClient = prismaPkg.PrismaClient;
  Prisma = prismaPkg.Prisma;
}

const componentConfigBindingKey = configBindingKeyFor<PrismaOptions>(
  PrismaBindings.COMPONENT,
);

/**
 * The component used to register the necessary artifacts for Prisma integration
 * with LoopBack 4.
 *
 * @remarks
 * This component was designed to be registered with
 * {@link @loopback/core#Application.component} or used standalone—This is to
 * enable more complex use-cases and easier testing.
 *
 * ## Providing custom PrismaClient
 * It is possible to provide a custom PrismaClient instance by either:
 *
 * - Providing a {@link @prisma/client#PrismaClient} instance into the
 *     constructor.
 * - Binding a {@link @prisma/client#PrismaClient} instance to
 *     {@link PrismaBindings.PRISMA_CLIENT_INSTANCE} before
 *     {@link PrismaComponent.init}.
 *
 * If a {@link @prisma/client#PrismaClient} instance is provided through the
 * constructor but not bound to context, a new binding will be created for
 * that instance.
 *
 * Note that if a {@link @prisma/client#PrismaClient} instance is provided
 * through both aforementioned methods, they must reference the same instance.
 * Otherwise, an error will be thrown when {@link PrismaComponent:constructor}
 * or {@link PrismaComponent.start} is called.
 *
 * ## Post-initialization restrictions
 * After `init()` is successfully called, the following scenarios will be
 * ignored by the component:
 *
 * - Manipulating {@link PrismaBindings.COMPONENT} configuration binding.
 * - Manipulating {@link PrismaBindings.PRISMA_CLIENT_INSTANCE} binding.
 * - Manipulating existing
 *     {@link PrismaBindings.PRISMA_MIDDLEWARE_EXTENSION_POINT} extension
 *     point bindings
 *
 * Furthermore, the following bindings will be locked:
 *
 * - Configuration binding key of {@link PrismaBindings.COMPONENT}
 * - {@link PrismaBindings.PRISMA_CLIENT_INSTANCE}
 *
 * These restrictions are in place as {@link @prisma/client#PrismaClient}
 * would have already been initialized.
 *
 * ## De-initialization
 * To de-initialize, replace the current instance with a new instance.
 *
 * @decorator `@lifeCycleObserver('datasource')`
 * @decorator `@extensionPoint(PRISMA_CLIENT_MIDDLEWARE_EXTENSION_POINT)`
 */
@lifeCycleObserver('datasource')
@extensionPoint(PrismaBindings.PRISMA_MIDDLEWARE_EXTENSION_POINT)
export class PrismaComponent implements Component, LifeCycleObserver {
  @inject.binding(componentConfigBindingKey, {
    bindingCreation: BindingCreationPolicy.CREATE_IF_NOT_BOUND,
  })
  private _optionsBinding: Binding<PrismaOptions>;
  @extensions.view()
  private _prismaMiddleware: ContextView<PrismaType.Middleware>;
  private _isInitialized = false;

  /**
   * Returns `true` if {@link PrismaComponent.init} has been called.
   *
   * @remarks
   * This is useful for ensuring that {@link PrismaComponent.init} is called
   * exactly once outside of {@link @loopback/core#LifeCycleObserverRegistry}
   * (e.g. as a prerequisite before calling {@link PrismaComponent.start}).
   */
  get isInitialized() {
    return this._isInitialized;
  }

  /**
   *
   * @param _app An instance of a generic or specialized
   * {@link @loopback/core#Application}.
   * @param _prismaClient An instance of {@link @prisma/client#PrismaClient}.
   * @param _options Initial component and {@link @prisma/client#PrismaClient}
   * configuration.
   */
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private _app: Application,
    @inject(PrismaBindings.PRISMA_CLIENT_INSTANCE, {optional: true})
    private _prismaClient?: PrismaClientType,
    @config()
    private _options: PrismaOptions = DEFAULT_PRISMA_OPTIONS,
  ) {
    PrismaComponent._ensureNoConflictingPrismaProvidedAndBound(
      this._app,
      this._prismaClient,
    );

    this._ensureValidPrismaConfiguration();

    // Necessary for standalone usage as the component is never bound to
    // context to allow the extension point view to resolve.
    this._prismaMiddleware ??= this._app.createView(
      extensionFilter(PrismaBindings.PRISMA_MIDDLEWARE_EXTENSION_POINT),
    );

    // Backlog and future middleware binding locking.

    function ensureValidPrismaMiddlewareBinding(
      binding: Readonly<Binding>,
    ): void {
      if (binding.scope !== BindingScope.SINGLETON)
        throw new PrismaMiddlewareUnsupportedBindingScopeError(
          BindingScope.SINGLETON,
        );
      else if (binding.type !== BindingType.CONSTANT)
        throw new PrismaMiddlewareUnsupportedBindingTypeError(
          BindingType.CONSTANT,
        );
    }

    for (const binding of this._prismaMiddleware.bindings) {
      ensureValidPrismaMiddlewareBinding(binding);
      binding.lock();
    }

    this._prismaMiddleware.on('bind', ({binding}) => {
      ensureValidPrismaMiddlewareBinding(binding);
      binding.lock();
    });

    // A workaround as BindingCreationPolicy.CREATE_IF_NOT_BOUND does not
    // return a binding.
    // It also creates a new binding if the binding creation policy was not
    // honored (i.e. Standalone usage).
    this._optionsBinding ??=
      this._app.getBinding(componentConfigBindingKey, {
        optional: true,
      }) ?? this._app.bind(componentConfigBindingKey);

    // Deep augment defaults for any unset options.
    if (this._options.models) {
      this._options.models.namespace ??=
        DEFAULT_PRISMA_OPTIONS.models!.namespace;
      this._options.models.tags ??= DEFAULT_PRISMA_OPTIONS.models!.tags;
    }

    if (!this._optionsBinding.type) {
      // Binds the options from constructor if there's non bound.
      // This happens if:
      // - The component is used standalone
      // - No configuration was bound before component initialization.
      this._app.bind(componentConfigBindingKey).to(this._options);
    }
  }

  /**
   * Checks if the Prisma configuration is possible. Throws an error if a
   * {@link @prisma/client#PrismaClient} instance is already created and
   * configuration is no longer passable.
   *
   * @remarks
   * This function is should only used at the start of a function that manages
   * configuration as this function only checks the local variables in
   * {@link PrismaComponent} and does not resolve bindings.
   *
   * This function also checks if {@link @loopback/logging} is installed if
   * {@link PrismaOptions.enableLoggingIntegration} is `true`, and throws if
   * not.
   */
  private _ensureValidPrismaConfiguration() {
    if (
      this._prismaClient &&
      (this._options.enableLoggingIntegration || this._options.prismaClient)
    ) {
      throw new PrismaClientConfigConflictError();
    }

    if (this._options.enableLoggingIntegration) require('@loopback/logging');
  }

  /**
   * Checks if a conflicting instance of Prisma is provided in the constructor
   * and bound to context.
   *
   * @returns `undefined` if the {@link @prisma/client#PrismaClient} instance
   * referenced in the constructor and binding are identical.
   */
  private static _ensureNoConflictingPrismaProvidedAndBound(
    application: Application,
    prismaClient?: PrismaClientType,
  ) {
    if (
      prismaClient &&
      prismaClient !==
        (application.getSync(PrismaBindings.PRISMA_CLIENT_INSTANCE, {
          optional: true,
        }) ?? prismaClient)
    ) {
      throw new Error(
        'A Prisma Client instance was provided whilst a different instance was bound to context.',
      );
    }
  }

  /**
   * Ensures that a {@link @prisma/client#PrismaClient} instance is bound if no
   * existing; Otherwise, ensure existing meets {@link @loopback/core#Binding}
   * requirements.
   *
   * @remarks
   * An existing {@link @prisma/client#PrismaClient}
   * {@link @loopback/core#Binding} must meet the following critera, otherwise
   * an error is thrown:
   *
   * - Bound as a {@link @loopback/core#BindingType.CONSTANT} type.
   * - Bound as a {@link @loopback/core#BindingScope.SINGLETON} scope.
   *
   * @param prismaClient An instance of {@link @prisma/client#PrismaClient}.
   * @param application An instance of {@link @loopback/core#Application}.
   */
  private static _ensureValidPrismaClientBinding(
    prismaClient: PrismaClientType,
    application: Application,
  ) {
    const prismaClientBinding = application.getBinding(
      PrismaBindings.PRISMA_CLIENT_INSTANCE,
      {optional: true},
    );

    if (!prismaClientBinding)
      application
        .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
        .to(prismaClient)
        .inScope(BindingScope.SINGLETON);
    else if (prismaClientBinding.scope !== BindingScope.SINGLETON)
      throw new PrismaClientInstanceUnsupportedBindingScopeError(
        BindingScope.SINGLETON,
      );
    else if (prismaClientBinding.type !== BindingType.CONSTANT) {
      throw new PrismaClientInstanceUnsupportedBindingTypeError(
        BindingType.CONSTANT,
      );
    }
  }

  /**
   * Initializes PrismaClient, if needed.
   *
   * @remarks
   * Calling this function will lock PrismaClient and configuration.
   *
   * If the component instance is already initialized, this function will be a
   * no-op.
   *
   * This function is also rather heavy, and should be called during app
   * initialization (whether as part of the datasource lifecycle or manually).
   */
  async init() {
    if (this._isInitialized) return;

    PrismaComponent._ensureNoConflictingPrismaProvidedAndBound(
      this._app,
      this._prismaClient,
    );

    this._ensureValidPrismaConfiguration();

    if (this._prismaClient) {
      PrismaComponent._ensureValidPrismaClientBinding(
        this._prismaClient,
        this._app,
      );
    } else {
      // Late refresh of Prisma options cache.
      this._options = await this._app.get(componentConfigBindingKey);

      const {enableLoggingIntegration, prismaClient: prismaOptions} =
        this._options;

      if (enableLoggingIntegration && prismaOptions) {
        prismaOptions.log = [
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'info',
          },
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ];

        // Re-bind new configuration
        this._app
          .bind(componentConfigBindingKey.deepProperty('prismaOptions'))
          .to(prismaOptions);
      }

      this._prismaClient = new PrismaClient(prismaOptions);

      // `@loopback/logging` integration, if configured.
      if (enableLoggingIntegration) {
        const {LoggingBindings} = await import('@loopback/logging');

        /**
         * Registers hooks to {@link @prisma/client#PrismaClient} to route logs
         * to the {@link @loopback/logging#WisntontLogger} instance.
         *
         * @param prismaClient A {@link @prisma/client#PrismaClient} instance.
         * @param logger A {@link @loopback/logging#WinstonLogger} instance.
         */
        const registerPrismaLoggingIntegration = (
          prismaClient: PrismaClientType,
          logger: WinstonLogger,
        ) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._prismaClient!.$on('error', (e: Prisma.LogEvent) => {
            logger.error(
              `[${e.timestamp}] @loopback/prisma (Prisma): Target: ${e.target}; Message: ${e.message}`,
            );
          });

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._prismaClient!.$on('info', (e: Prisma.LogEvent) => {
            logger.warn(
              `[${e.timestamp}] @loopback/prisma (Prisma): Target: ${e.target}; Message: ${e.message}`,
            );
          });

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._prismaClient!.$on('query', (e: Prisma.QueryEvent) => {
            logger.debug(
              `[${e.timestamp}] @loopback/prisma (Prisma): Query to ${e.target} (${e.duration} ms); Query: ${e.query} -- Params: ${e.params}`,
            );
          });

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this._prismaClient!.$on('warn', (e: Prisma.LogEvent) => {
            logger.warn(
              `[${e.timestamp}] @loopback/prisma (Prisma): Target: ${e.target}; Message: ${e.message}`,
            );
          });
        };

        const logger = await this._app.get(LoggingBindings.WINSTON_LOGGER, {
          optional: true,
        });

        if (!logger) {
          const loggerBinding = this._app.getBinding(
            LoggingBindings.WINSTON_LOGGER,
            {optional: true},
          );

          if (!loggerBinding) {
            const loggerBindingNew = this._app.add(
              new Binding(LoggingBindings.WINSTON_LOGGER),
            );
            loggerBindingNew.once('bind', ({binding, context}) => {
              if (binding.type) {
                const loggerInstance = context.getSync(
                  LoggingBindings.WINSTON_LOGGER,
                );
                registerPrismaLoggingIntegration(
                  this._prismaClient!,
                  loggerInstance,
                );
              }
            });
          }
        } else {
          registerPrismaLoggingIntegration(this._prismaClient!, logger);
        }
      }

      // Bind new PrismaClient instance to context.
      this._app
        .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
        .to(this._prismaClient)
        .inScope(BindingScope.SINGLETON);
    }

    const prismaClientBinding = this._app.getBinding(
      PrismaBindings.PRISMA_CLIENT_INSTANCE,
    );

    // Lock the these bindings as changes after initialization are not
    // supported.
    this._optionsBinding.lock();
    prismaClientBinding.lock();

    // Initiate middleware backlog and future registration
    const prismaMiddlewares = await this._prismaMiddleware.values();
    for (const middleware of prismaMiddlewares)
      this._prismaClient!.$use(middleware);

    this._prismaMiddleware.on('bind', ({binding, context}) => {
      this._prismaClient!.$use(context.getSync(binding.key));
    });

    // Bind models
    for (const modelName in Prisma.ModelName) {
      this._app.add(
        createBindingFromPrismaModelName(
          modelName,
          this._prismaClient[modelName.toLowerCase() as keyof PrismaClientType],
        ).lock(),
      );
    }

    this._isInitialized = true;
  }

  /**
   * Start Prisma datasource connections, if needed.
   *
   * @remarks
   * If {@link PrismaComponent.init} hasn't been caled, it will be called
   * implicitly.
   *
   * If {@link PrismaOptions.lazyConnect} is `true`,
   * {@link @prisma/client#PrismaClient.$connect} is called. Otherwise, this is
   * a no-op function.
   *
   * @returns `undefined` if {@link PrismaOptions.lazyConnect} is `true`, else
   * {@link @prisma/client#PrismaClient.$connect} promise.
   */
  async start() {
    if (!this._isInitialized) await this.init();
    if (this._options.lazyConnect) return;
    return this._prismaClient!.$connect();
  }

  /**
   * Stops Prisma datasource connections.
   *
   * @remarks
   * If {@link PrismaComponent.init} hasn't been called, this will be a no-op
   * function.
   *
   * @returns return value from {@link @prisma/client#PrismaClient.$disconnect}.
   */
  stop() {
    if (!this._isInitialized) return;
    return this._prismaClient!.$disconnect();
  }
}
