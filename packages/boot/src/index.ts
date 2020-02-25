// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A convention based project Bootstrapper and Booters for LoopBack
 * Applications.
 *
 * @remarks
 * A Booter is a class that can be bound to an Application and is called to
 * perform a task before the Application is started. A Booter may have multiple
 * phases to complete its task. The task for a convention based Booter is to
 * discover and bind Artifacts (Controllers, Repositories, Models, etc.).
 *
 * An example task of a Booter may be to discover and bind all artifacts of a
 * given type.
 *
 * A Bootstrapper is needed to manage the Booters and execute them. This is
 * provided in this package. For ease of use, everything needed is packages
 * using a BootMixin. This Mixin will add convenience methods such as `boot` and
 * `booter`, as well as properties needed for Bootstrapper such as
 * `projectRoot`. The Mixin also adds the `BootComponent` to your `Application`
 * which binds the `Bootstrapper` and default `Booters` made available by this
 * package.
 *
 * @packageDocumentation
 */

export * from './boot.component';
export * from './booters';
export * from './bootstrapper';
export * from './keys';
export * from './mixins';
export * from './types';
