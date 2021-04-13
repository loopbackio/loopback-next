// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingScope,
  ControllerClass,
  CoreBindings,
  extensions,
  Getter,
  inject,
  injectable,
} from '@loopback/core';
import {
  asSpecEnhancer,
  ComponentsObject,
  mergeOpenAPISpec,
  OASEnhancer,
  OpenApiSpec,
  OperationObject,
  SecurityRequirementObject,
} from '@loopback/rest';
// import debugFactory from 'debug';
import {getAuthenticateMetadata} from '../decorators';
import {AuthenticationBindings} from '../keys';
import {AuthenticationStrategy} from '../types';

// const debug = debugFactory('loopback:openapi:spec-enhancer:security');

@injectable(asSpecEnhancer, {scope: BindingScope.SINGLETON})
export class SecuritySpecEnhancer implements OASEnhancer {
  name = 'security';

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private app: Application,
    @extensions(
      AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    )
    private getStrategies: Getter<AuthenticationStrategy[]>,
  ) {}

  async modifySpec(spec: OpenApiSpec): Promise<OpenApiSpec> {
    const securitySchemes: ComponentsObject['securitySchemes'] = {};
    const existingStrategies = await this.getStrategies();
    const strategyMapping = SecuritySpecEnhancer.createStrategyMapping(
      existingStrategies,
    );

    const {paths} = spec;
    for (const path in paths) {
      for (const op in paths[path]) {
        const operation: OperationObject = paths[path][op];

        const methodName: string = operation['x-operation-name'];
        const controllerName: string = operation['x-controller-name'];

        const binding = this.app.getBinding(
          `${CoreBindings.CONTROLLERS}.${controllerName}`,
          {
            optional: true,
          },
        );
        if (!binding) continue;

        const controllerClass: ControllerClass = binding.valueConstructor!;

        const metadata = getAuthenticateMetadata(controllerClass, methodName);
        if (!metadata) continue;

        const strategyNames = metadata.map(m => m.strategy);

        const security: SecurityRequirementObject[] = operation.security ?? [];

        for (const name of strategyNames) {
          const strategy = strategyMapping[name];
          if (strategy?.securitySpec) {
            const securitySpecs = await strategy.securitySpec();

            for (const securitySpec of SecuritySpecEnhancer.castArray(
              securitySpecs,
            )) {
              security.push(securitySpec.operationSecurity);
              securitySchemes[securitySpec.schemeName] =
                securitySpec.securityScheme;
            }
          }
        }

        operation.security = security;
      }
    }

    return mergeOpenAPISpec(spec, {components: {securitySchemes}});
  }

  private static createStrategyMapping(
    strategies: AuthenticationStrategy[],
  ): {[name: string]: AuthenticationStrategy} {
    const strategyMapping: {[name: string]: AuthenticationStrategy} = {};

    for (const strategy of strategies) {
      strategyMapping[strategy.name] = strategy;
    }

    return strategyMapping;
  }

  private static castArray<T = unknown>(value?: T | T[]): T[] {
    return Array.isArray(value) ? value : value !== undefined ? [value] : [];
  }
}
