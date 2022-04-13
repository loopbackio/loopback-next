// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  BindingFilter,
  Constructor,
  CoreBindings,
  createBindingFromClass,
  inject,
} from '@loopback/core';
import debugFactory from 'debug';
import {BootBindings} from '../keys';
import {Bootable, Booter, booter} from '../types';

const debug = debugFactory('loopback:boot:booter:component-application');

/**
 * Binding keys excluded from a sub application. These bindings booted from the
 * sub application won't be added to the main application.
 */
export const bindingKeysExcludedFromSubApp = [
  BootBindings.BOOT_OPTIONS.key,
  BootBindings.PROJECT_ROOT.key,
  BootBindings.BOOTSTRAPPER_KEY.key,
  CoreBindings.APPLICATION_CONFIG.key,
  CoreBindings.APPLICATION_INSTANCE.key,
  CoreBindings.APPLICATION_METADATA.key,
  CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY.key,
  CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS.key,
];

/**
 * Create a booter that boots the component application. Bindings that exist
 * in the component application before `boot` are skipped. Locked bindings in
 * the main application will not be overridden.
 *
 * @param componentApp - The application exposing a component
 * @param filter Binding filter to selected bindings to be added
 */
export function createBooterForComponentApplication(
  componentApp: Application & Bootable,
  filter: BindingFilter = () => true,
): Constructor<Booter> {
  /**
   * A booter to boot artifacts for the component application
   */
  @booter('componentApplications')
  class ComponentApplicationBooter implements Booter {
    constructor(
      @inject(CoreBindings.APPLICATION_INSTANCE) private mainApp: Application,
    ) {}

    async load() {
      /**
       * List all bindings before boot
       */
      let bindings = componentApp.find(() => true);
      const bindingsBeforeBoot = new Set(bindings);
      // Boot the component application
      await componentApp.boot();
      /**
       * Add bindings from the component application to the main application
       */
      bindings = componentApp.find(filter);
      for (const binding of bindings) {
        // Exclude boot related bindings
        if (bindingKeysExcludedFromSubApp.includes(binding.key)) continue;

        // Exclude bindings from the app before boot
        if (bindingsBeforeBoot.has(binding)) {
          debug(
            'Skipping binding %s that exists before booting %s',
            binding.key,
            componentApp.name,
          );
          continue;
        }

        // Do not override locked bindings
        const locked = this.mainApp.find(binding.key).some(b => b.isLocked);
        if (locked) {
          debug(
            'Skipping binding %s from %s - locked in %s',
            binding.key,
            componentApp.name,
            this.mainApp.name,
          );
          continue;
        }

        debug(
          'Adding binding from %s to %s',
          componentApp.name,
          this.mainApp.name,
          binding,
        );
        this.mainApp.add(binding as Binding);
      }
    }
  }
  return ComponentApplicationBooter;
}

/**
 * Create a binding to register a booter that boots the component application.
 * Bindings that exist in the component application before `boot` are skipped.
 * Locked bindings in the main application will not be overridden.
 *
 * @param componentApp - The application exposing a component
 * @param filter Binding filter to selected bindings to be added
 */
export function createComponentApplicationBooterBinding(
  componentApp: Application & Bootable,
  filter?: BindingFilter,
) {
  return createBindingFromClass(
    createBooterForComponentApplication(componentApp, filter),
    {key: `booters.${componentApp.name}`},
  );
}
