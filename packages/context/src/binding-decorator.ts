// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ClassDecoratorFactory} from '@loopback/metadata';
import {
  asBindingTemplate,
  asClassOrProvider,
  asProvider,
  BindingMetadata,
  BindingSpec,
  BINDING_METADATA_KEY,
  isProviderClass,
  removeNameAndKeyTags,
} from './binding-inspector';
import {Constructor} from './value-promise';

/**
 * Decorator factory for `@injectable`
 */
class InjectableDecoratorFactory extends ClassDecoratorFactory<BindingMetadata> {
  mergeWithInherited(inherited: BindingMetadata, target: Function) {
    if (inherited) {
      return {
        templates: [
          ...inherited.templates,
          removeNameAndKeyTags,
          ...this.spec.templates,
        ],
        target: this.spec.target,
      };
    } else {
      this.withTarget(this.spec, target);
      return this.spec;
    }
  }

  mergeWithOwn(ownMetadata: BindingMetadata) {
    return {
      templates: [...ownMetadata.templates, ...this.spec.templates],
      target: this.spec.target,
    };
  }

  withTarget(spec: BindingMetadata, target: Function) {
    spec.target = target as Constructor<unknown>;
    return spec;
  }
}

/**
 * Decorate a class with binding configuration
 *
 * @example
 * ```ts
 * @injectable((binding) => {binding.inScope(BindingScope.SINGLETON).tag('controller')}
 * )
 * @injectable({scope: BindingScope.SINGLETON})
 * export class MyController {
 * }
 * ```
 *
 * @param specs - A list of binding scope/tags or template functions to
 * configure the binding
 */
export function injectable(...specs: BindingSpec[]): ClassDecorator {
  const templateFunctions = specs.map(t => {
    if (typeof t === 'function') {
      return t;
    } else {
      return asBindingTemplate(t);
    }
  });

  return (target: Function) => {
    const cls = target as Constructor<unknown>;
    const spec: BindingMetadata = {
      templates: [asClassOrProvider(cls), ...templateFunctions],
      target: cls,
    };

    const decorator = InjectableDecoratorFactory.createDecorator(
      BINDING_METADATA_KEY,
      spec,
      {decoratorName: '@injectable'},
    );
    decorator(target);
  };
}

/**
 * A namespace to host shortcuts for `@injectable`
 */
export namespace injectable {
  /**
   * `@injectable.provider` to denote a provider class
   *
   * A list of binding scope/tags or template functions to configure the binding
   */
  export function provider(
    ...specs: BindingSpec[]
  ): (target: Constructor<unknown>) => void {
    return (target: Constructor<unknown>) => {
      if (!isProviderClass(target)) {
        throw new Error(`Target ${target} is not a Provider`);
      }
      injectable(
        // Set up the default for providers
        asProvider(target),
        // Call other template functions
        ...specs,
      )(target);
    };
  }
}

/**
 * `@bind` is now an alias to {@link injectable} for backward compatibility
 * {@inheritDoc injectable}
 */
export function bind(...specs: BindingSpec[]): ClassDecorator {
  return injectable(...specs);
}

/**
 * Alias namespace `bind` to `injectable` for backward compatibility
 *
 * It should have the same members as `bind`.
 */
export namespace bind {
  /**
   * {@inheritDoc injectable.provider}
   */
  export const provider = injectable.provider;
}
