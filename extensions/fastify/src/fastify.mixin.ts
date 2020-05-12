// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/fastify
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Constructor,
  Context,
  CoreTags,
  LifeCycleObserver,
  MixinTarget,
  transformValueOrPromise,
  ValueOrPromise,
} from '@loopback/core';
import {
  getControllerSpec,
  OperationObject,
  ParameterObject,
} from '@loopback/openapi-v3';
import debugFactory from 'debug';
import Fastify, {HTTPMethod} from 'fastify';
import HttpErrors from 'http-errors';
import {inspect} from 'util';
import {
  FastifyServerResolvedConfig,
  resolveFastifyServerConfig,
} from './fastify.config';
import {FastifyBindings} from './fastify.keys';
import {FastifyInstance, Reply, Request} from './fastify.types';

const debug = debugFactory('loopback:fastify:mixin');

export function FastifyMixin<T extends MixinTarget<Context>>(superClass: T) {
  return class extends superClass implements WithFastify {
    readonly fastify: FastifyInstance;
    url: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);

      const config = resolveFastifyServerConfig(
        this.getSync(FastifyBindings.CONFIG),
      );

      // fastify modifies the provided config object, we create a copy to avoid
      // changing the config object in our bindings
      this.fastify = Fastify({...config});
      setupLifecycleObserver(this, config);
      setupBindingObserver(this);
    }
  };
}

declare interface WithFastify {
  readonly fastify: FastifyInstance;
  url: string;
}

type ServerContext = InstanceType<MixinTarget<Context>> & WithFastify;

function setupLifecycleObserver(
  serverContext: ServerContext,
  config: FastifyServerResolvedConfig,
) {
  serverContext
    .bind<LifeCycleObserver>('fastify-lifecycle-observer')
    .tag(CoreTags.LIFE_CYCLE_OBSERVER)
    .to({
      async start() {
        debug('Starting Fastify server with config', config);
        serverContext.url = await serverContext.fastify.listen(config);
        debug('Fastify server listening at %s', serverContext.url);
      },

      stop() {
        debug('Stopping Fastify server');
        return serverContext.fastify.close();
      },
    });
}

function setupBindingObserver(serverContext: ServerContext) {
  serverContext.on('bind', ({binding}) => {
    if (!isControllerBinding(binding)) return;
    registerController(serverContext, binding);
  });
}

function registerController(
  serverContext: ServerContext,
  binding: Readonly<Binding>,
) {
  const controllerName = binding.key.replace(/^controllers\./, '');
  const ctor = binding.valueConstructor;
  if (!ctor) {
    throw new Error(
      `The controller ${controllerName} was not bound via .toClass()`,
    );
  }

  const apiSpec = getControllerSpec(ctor);
  if (!apiSpec) {
    // controller methods are specified through app.api() spec
    debug('Skipping controller %s - no API spec provided', controllerName);
    return;
  }

  debug(
    'Registering controller %s with API spec %s',
    controllerName,
    inspect(apiSpec, {depth: null}),
  );

  /* TODO: register apiSpec.components with Fastify schema resolver
  if (apiSpec.components) {
    this._httpHandler.registerApiComponents(apiSpec.components);
  }
  */

  if (!apiSpec.paths || !Object.keys(apiSpec.paths).length) {
    return;
  }

  const basePath = apiSpec.basePath ?? '/';

  for (const path in apiSpec.paths) {
    for (const verb in apiSpec.paths[path]) {
      const opSpec: OperationObject = apiSpec.paths[path][verb];
      const fullPath = joinPath(basePath, path);

      const controllerMethodName = opSpec['x-operation-name'];
      if (!controllerMethodName) {
        throw new Error(
          'Controller method name must be provided via "x-operation-name" ' +
            'extension field in OpenAPI spec. ' +
            `Operation: "${verb} ${path}" ` +
            `Controller: ${controllerName}.`,
        );
      }

      if (debug.enabled) {
        debug(
          'Registering route %s %s -> %s(%s)',
          verb.toUpperCase(),
          path,
          `${ctor.name}.${controllerMethodName}`,
          describeOperationParameters(opSpec),
        );
      }

      serverContext.fastify.route({
        method: verb.toUpperCase() as HTTPMethod,
        url: fullPath,
        // TODO: describe query, params, headers,request & response body
        // using opSpec
        handler: async function (
          this: FastifyInstance,
          request: Request,
          reply: Reply,
        ): Promise<unknown> {
          const parentContext = (serverContext as unknown) as Context;
          const controllerFactory: ControllerFactory = requestContext =>
            requestContext.getValueOrPromise(binding.key) as ValueOrPromise<
              ControllerInstance
            >;

          return invokeControllerMethod(
            parentContext,
            ctor,
            controllerFactory,
            controllerMethodName,
            request,
          );
        },
      });
    }
  }
}

// Copied from packages/rest/src/router/controller-route.ts
// Do we want to share this helper, perhaps via `@loopback/openapi-v3` package?
export function joinPath(basePath: string, path: string) {
  const fullPath = [basePath, path]
    .join('/') // Join by /
    .replace(/(\/){2,}/g, '/') // Remove extra /
    .replace(/\/$/, '') // Remove trailing /
    .replace(/^(\/)?/, '/'); // Add leading /
  return fullPath;
}

// Copied from packages/rest/src/router/routing-table.ts
// Do we want to share this helper, perhaps via `@loopback/openapi-v3` package?
function describeOperationParameters(opSpec: OperationObject) {
  return ((opSpec.parameters as ParameterObject[]) || [])
    .map(p => p?.name || '')
    .join(', ');
}

// FIXME(bajtos) Move this helper to `@loopback/core` and refactor
// `@loopback/rest` to use it too.
function isControllerBinding(binding: Readonly<Binding>) {
  return /^controllers./.test(binding.key);
}

interface ControllerInstance {
  [name: string]: unknown;
}
type ControllerFactory = (ctx: Context) => ValueOrPromise<ControllerInstance>;

function invokeControllerMethod(
  parentContext: Context,
  controllerCtor: Constructor<ControllerInstance>,
  controllerFactory: ControllerFactory,
  controllerMethodName: string,
  request: Request,
): ValueOrPromise<unknown> {
  const requestContext = new Context(parentContext);

  // TODO: parse args from the request
  const args: unknown[] = [];

  return transformValueOrPromise(controllerFactory(requestContext), invoke);

  function invoke(controller: ControllerInstance) {
    if (typeof controller[controllerMethodName] !== 'function') {
      const desc = `${controllerCtor.name}.${controllerMethodName}`;
      throw new HttpErrors.NotFound(`Controller method not found: ${desc}`);
    }
    return (controller[controllerMethodName] as Function)(...args);
  }
}
