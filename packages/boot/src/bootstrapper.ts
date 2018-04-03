// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {resolve} from 'path';
import {Context, inject, resolveList} from '@loopback/context';
import {CoreBindings, Application} from '@loopback/core';
import {
  BootOptions,
  BootExecutionOptions,
  BOOTER_PHASES,
  Bootable,
} from './interfaces';
import {BootBindings} from './keys';
import {_bindBooter} from './mixins';

import * as debugModule from 'debug';
const debug = debugModule('loopback:boot:bootstrapper');

/**
 * The Bootstrapper class provides the `boot` function that is responsible for
 * finding and executing the Booters in an application based on given options.
 *
 * NOTE: Bootstrapper should be bound as a SINGLETON so it can be cached as
 * it does not maintain any state of it's own.
 *
 * @param app Application instance
 * @param projectRoot The root directory of the project, relative to which all other paths are resolved
 * @param [bootOptions] The BootOptions describing the conventions to be used by various Booters
 */
export class Bootstrapper {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private app: Application & Bootable,
    @inject(BootBindings.PROJECT_ROOT) private projectRoot: string,
    @inject(BootBindings.BOOT_OPTIONS) private bootOptions: BootOptions = {},
  ) {
    // Resolve path to projectRoot and re-bind
    this.projectRoot = resolve(this.projectRoot);
    app.bind(BootBindings.PROJECT_ROOT).to(this.projectRoot);

    // This is re-bound for testing reasons where this value may be passed directly
    // and needs to be propagated to the Booters via DI
    app.bind(BootBindings.BOOT_OPTIONS).to(this.bootOptions);
  }

  /**
   * Function is responsible for calling all registered Booter classes that
   * are bound to the Application instance. Each phase of an instance must
   * complete before the next phase is started.
   *
   * @param {BootExecutionOptions} execOptions Execution options for boot. These
   * determine the phases and booters that are run.
   * @param {Context} [ctx] Optional Context to use to resolve bindings. This is
   * primarily useful when running app.boot() again but with different settings
   * (in particular phases) such as 'start' / 'stop'. Using a returned Context from
   * a previous boot call allows DI to retrieve the same instances of Booters previously
   * used as they are bound using a CONTEXT scope. This is important as Booter instances
   * may maintain state.
   */
  async boot(
    execOptions?: BootExecutionOptions,
    ctx?: Context,
  ): Promise<Context> {
    const bootCtx = ctx || new Context(this.app);

    // Bind booters passed in as a part of BootOptions
    // We use _bindBooter so this Class can be used without the Mixin
    if (execOptions && execOptions.booters) {
      execOptions.booters.forEach(booter =>
        // tslint:disable-next-line:no-any
        _bindBooter(this.app, booter),
      );
    }

    // Determine the phases to be run. If a user set a phases filter, those
    // are selected otherwise we run the default phases (BOOTER_PHASES).
    const phases = execOptions
      ? execOptions.filter && execOptions.filter.phases
        ? execOptions.filter.phases
        : BOOTER_PHASES
      : BOOTER_PHASES;

    // Find booters registered to the BOOTERS_TAG by getting the bindings
    const bindings = bootCtx.findByTag(BootBindings.BOOTER_TAG);

    // Prefix length. +1 because of `.` => 'booters.'
    const prefix_length = BootBindings.BOOTER_PREFIX.length + 1;

    // Names of all registered booters.
    const defaultBooterNames = bindings.map(binding =>
      binding.key.slice(prefix_length),
    );

    // Determing the booters to be run. If a user set a booters filter (class
    // names of booters that should be run), that is the value, otherwise it
    // is all the registered booters by default.
    const names = execOptions
      ? execOptions.filter && execOptions.filter.booters
        ? execOptions.filter.booters
        : defaultBooterNames
      : defaultBooterNames;

    // Filter bindings by names
    const filteredBindings = bindings.filter(binding =>
      names.includes(binding.key.slice(prefix_length)),
    );

    // Resolve Booter Instances
    const booterInsts = await resolveList(filteredBindings, binding =>
      // We cannot use Booter interface here because "filter.booters"
      // allows arbitrary string values, not only the phases defined
      // by Booter interface
      bootCtx.get<{[phase: string]: () => Promise<void>}>(binding.key),
    );

    // Run phases of booters
    for (const phase of phases) {
      for (const inst of booterInsts) {
        const instName = inst.constructor.name;
        if (inst[phase]) {
          debug(`${instName} phase: ${phase} starting.`);
          await inst[phase]();
          debug(`${instName} phase: ${phase} complete.`);
        } else {
          debug(`${instName} phase: ${phase} not implemented.`);
        }
      }
    }

    return bootCtx;
  }
}
