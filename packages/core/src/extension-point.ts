// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Context,
  Binding,
  inject,
  resolveList,
  Injection,
  ResolutionSession,
} from '@loopback/context';

// tslint:disable:no-any
/**
 * Interface for the extension point configuration
 */
export interface ExtensionPointConfig {
  // Configuration properties for the extension point itself
  [property: string]: any;
}

/**
 * Base class for extension points
 */
export abstract class ExtensionPoint<EXT extends object> {
  /**
   * Configuration (typically to be injected)
   */
  @inject.config() public readonly config: ExtensionPointConfig = {};

  /**
   * Name of the extension point. The subclass must set the value.
   */
  static extensionPointName: string;

  /**
   * The unique name of this extension point. It also serves as the binding
   * key prefix for bound extensions
   */
  public readonly name: string;

  constructor() {
    const ctor = this.constructor as typeof ExtensionPoint;
    this.name = ctor.extensionPointName;
    if (!this.name) {
      throw new Error(`${ctor.name}.extensionPointName must be set`);
    }
  }

  /**
   * Find an array of bindings for extensions
   */
  getAllExtensionBindings(ctx: Context): Readonly<Binding>[] {
    return ctx.findByTag(this.getTagForExtensions());
  }

  /**
   * Get the binding tag for extensions of this extension point
   */
  protected getTagForExtensions() {
    return {extensionPoint: this.name};
  }

  /**
   * Get a map of extension bindings by the keys
   */
  getExtensionBindingMap(ctx: Context): {[name: string]: Readonly<Binding>} {
    const extensionBindingMap: {[name: string]: Readonly<Binding>} = {};
    const bindings = this.getAllExtensionBindings(ctx);
    bindings.forEach(binding => {
      extensionBindingMap[binding.key] = binding;
    });
    return extensionBindingMap;
  }

  /**
   * Look up an extension binding by name
   * @param extensionName Name of the extension
   */
  getExtensionBinding(ctx: Context, extensionName: string): Readonly<Binding> {
    const bindings = this.getAllExtensionBindings(ctx);
    const binding = bindings.find(b => b.tagMap.name === extensionName);
    if (binding == null)
      throw new Error(
        `Extension ${extensionName} does not exist for extension point ${
          this.name
        }`,
      );
    return binding;
  }

  /**
   * Get configuration for this extension point
   */
  getConfiguration() {
    return this.config;
  }

  /**
   * Get configuration for an extension of this extension point
   * @param extensionName Name of the extension
   */
  async getExtensionConfiguration(ctx: Context, extensionName: string) {
    return (await ctx.getConfig(`${this.name}.${extensionName}`)) || {};
  }

  /**
   * Get an instance of an extension by name
   * @param extensionName Name of the extension
   */
  async getExtension(ctx: Context, extensionName: string): Promise<EXT> {
    const binding = this.getExtensionBinding(ctx, extensionName);
    return binding.getValue(ctx);
  }

  /**
   * Get an array of registered extension instances
   */
  async getAllExtensions(ctx: Context): Promise<EXT[]> {
    const bindings = this.getAllExtensionBindings(ctx);
    return resolveList(bindings, async binding => {
      return await binding.getValue(ctx);
    });
  }

  /**
   * Get the name tag (name:extension-name) associated with the binding
   * @param binding
   */
  static getExtensionName(binding: Binding) {
    return binding.tagMap.name;
  }
}

/**
 * @extensions() - decorator to inject extensions
 */
export function extensions() {
  return inject(
    '',
    {decorator: '@extensions'},
    (ctx: Context, injection: Injection, session?: ResolutionSession) => {
      const target = injection.target;
      const ctor: any =
        target instanceof Function ? target : target.constructor;
      if (ctor.extensionPointName) {
        const bindings = ctx.findByTag({
          extensionPoint: ctor.extensionPointName,
        });
        return resolveList(bindings, b => {
          // We need to clone the session so that resolution of multiple
          // bindings can be tracked in parallel
          return b.getValue(ctx, ResolutionSession.fork(session));
        });
      }
      throw new Error(
        '@extensions must be used within a extension point class',
      );
    },
  );
}
