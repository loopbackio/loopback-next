// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/booter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingSpec, ContextTags, injectable} from '@loopback/core';
import {BooterBindings, BooterTags} from './keys';

/**
 * `@booter` decorator to mark a class as a `Booter` and specify the artifact
 * namespace for the configuration of the booter
 *
 * @example
 * ```ts
 * @booter('controllers')
 * export class ControllerBooter extends BaseArtifactBooter {
 *   constructor(
 *     @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
 *     @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
 *     @config()
 *    public controllerConfig: ArtifactOptions = {},
 *   ) {
 *   // ...
 *   }
 * }
 * ```
 *
 * @param artifactNamespace - Namespace for the artifact. It will be used to
 * inject configuration from boot options. For example, the Booter class
 * decorated with `@booter('controllers')` can receive its configuration via
 * `@config()` from the `controllers` property of boot options.
 *
 * @param specs - Extra specs for the binding
 */
export function booter(artifactNamespace: string, ...specs: BindingSpec[]) {
  return injectable(
    {
      tags: {
        artifactNamespace,
        [BooterTags.BOOTER]: BooterTags.BOOTER,
        [ContextTags.NAMESPACE]: BooterBindings.BOOTERS,
      },
    },
    ...specs,
  );
}
