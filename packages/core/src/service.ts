// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingFilter,
  BindingFromClassOptions,
  BindingTemplate,
  bindingTemplateFor,
  ContextTags,
  ContextView,
  createBindingFromClass,
  DecoratorFactory,
  inject,
  InjectionMetadata,
  isDynamicValueProviderClass,
  isProviderClass,
  MetadataInspector,
  transformValueOrPromise,
} from '@loopback/context';
import {ServiceOrProviderClass} from './application';
import {CoreTags} from './keys';

/**
 * Representing an interface for services. In TypeScript, the `interface` does
 * not have reflections at runtime. We use a string, a symbol or a Function as
 * the type for the service interface.
 */
export type ServiceInterface = string | symbol | Function;

/**
 * Options to register a service binding
 */
export interface ServiceOptions extends BindingFromClassOptions {
  interface?: ServiceInterface;
}

/**
 * `@service` injects a service instance that matches the class or interface.
 *
 * @param serviceInterface - Interface for the service. It can be in one of the
 * following forms:
 *
 * - A class, such as MyService
 * - A string that identifies the interface, such as `'MyService'`
 * - A symbol that identifies the interface, such as `Symbol('MyService')`
 *
 * If not provided, the value is inferred from the design:type of the parameter
 * or property
 *
 * @example
 * ```ts
 *
 * const ctx = new Context();
 * ctx.bind('my-service').toClass(MyService);
 * ctx.bind('logger').toClass(Logger);
 *
 * export class MyController {
 *   constructor(@service(MyService) private myService: MyService) {}
 *
 *   @service()
 *   private logger: Logger;
 * }
 *
 * ctx.bind('my-controller').toClass(MyController);
 * await myController = ctx.get<MyController>('my-controller');
 * ```
 */
export function service(
  serviceInterface?: ServiceInterface,
  metadata?: InjectionMetadata,
) {
  return inject(
    '',
    {decorator: '@service', ...metadata},
    (ctx, injection, session) => {
      let serviceType = serviceInterface;
      if (!serviceType) {
        if (typeof injection.methodDescriptorOrParameterIndex === 'number') {
          serviceType = MetadataInspector.getDesignTypeForMethod(
            injection.target,
            injection.member!,
          )?.parameterTypes[injection.methodDescriptorOrParameterIndex];
        } else {
          serviceType = MetadataInspector.getDesignTypeForProperty(
            injection.target,
            injection.member!,
          );
        }
      }
      if (serviceType === undefined) {
        const targetName = DecoratorFactory.getTargetName(
          injection.target,
          injection.member,
          injection.methodDescriptorOrParameterIndex,
        );
        const msg =
          `No design-time type metadata found while inspecting ${targetName}. ` +
          'You can either use `@service(ServiceClass)` or ensure `emitDecoratorMetadata` is enabled in your TypeScript configuration. ' +
          'Run `tsc --showConfig` to print the final TypeScript configuration of your project.';
        throw new Error(msg);
      }

      if (serviceType === Object || serviceType === Array) {
        throw new Error(
          'Service class cannot be inferred from design type. Use @service(ServiceClass).',
        );
      }
      const view = new ContextView(ctx, filterByServiceInterface(serviceType));
      const result = view.resolve({
        optional: metadata?.optional,
        asProxyWithInterceptors: metadata?.asProxyWithInterceptors,
        session,
      });

      const serviceTypeName =
        typeof serviceType === 'string'
          ? serviceType
          : typeof serviceType === 'symbol'
            ? serviceType.toString()
            : serviceType.name;
      return transformValueOrPromise(result, values => {
        if (values.length === 1) return values[0];
        if (values.length >= 1) {
          throw new Error(
            `More than one bindings found for ${serviceTypeName}`,
          );
        } else {
          if (metadata?.optional) {
            return undefined;
          }
          throw new Error(
            `No binding found for ${serviceTypeName}. Make sure a service ` +
              `binding is created in context ${ctx.name} with serviceInterface (${serviceTypeName}).`,
          );
        }
      });
    },
  );
}

/**
 * Create a binding filter by service class
 * @param serviceInterface - Service class matching the one used by `binding.toClass()`
 * @param options - Options to control if subclasses should be skipped for matching
 */
export function filterByServiceInterface(
  serviceInterface: ServiceInterface,
): BindingFilter {
  return binding =>
    binding.valueConstructor === serviceInterface ||
    binding.tagMap[CoreTags.SERVICE_INTERFACE] === serviceInterface;
}

/**
 * Create a service binding from a class or provider
 * @param cls - Service class or provider
 * @param options - Service options
 */
export function createServiceBinding<S>(
  cls: ServiceOrProviderClass<S>,
  options: ServiceOptions = {},
): Binding<S> {
  let name = options.name;
  if (!name && isProviderClass(cls)) {
    // Trim `Provider` from the default service name
    // This is needed to keep backward compatibility
    const templateFn = bindingTemplateFor(cls);
    const template = Binding.bind<S>('template').apply(templateFn);
    if (
      template.tagMap[ContextTags.PROVIDER] &&
      !template.tagMap[ContextTags.NAME]
    ) {
      // The class is a provider and no `name` tag is found
      name = cls.name.replace(/Provider$/, '');
    }
  }
  if (!name && isDynamicValueProviderClass(cls)) {
    // Trim `Provider` from the default service name
    const templateFn = bindingTemplateFor(cls);
    const template = Binding.bind<S>('template').apply(templateFn);
    if (
      template.tagMap[ContextTags.DYNAMIC_VALUE_PROVIDER] &&
      !template.tagMap[ContextTags.NAME]
    ) {
      // The class is a provider and no `name` tag is found
      name = cls.name.replace(/Provider$/, '');
    }
  }
  const binding = createBindingFromClass(cls, {
    name,
    type: CoreTags.SERVICE,
    ...options,
  }).apply(asService(options.interface ?? cls));
  return binding;
}

/**
 * Create a binding template for a service interface
 * @param serviceInterface - Service interface
 */
export function asService(serviceInterface: ServiceInterface): BindingTemplate {
  return function serviceTemplate(binding: Binding) {
    binding.tag({
      [ContextTags.TYPE]: CoreTags.SERVICE,
      [CoreTags.SERVICE_INTERFACE]: serviceInterface,
    });
  };
}
