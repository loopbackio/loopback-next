// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';

/**
 * Shortcut to inject configuration for the target binding. To be promoted
 * as `@inject.config` in `@loopback/context` module.
 *
 * See https://github.com/strongloop/loopback-next/pull/2259
 */
export function configuration() {
  return inject(
    '',
    {decorator: '@inject.config', optional: true},
    (ctx, injection, session) => {
      // Find the key of the target binding
      if (!session.currentBinding) return undefined;
      const key = session.currentBinding!.key;
      return ctx.get(`${key}.options`, {
        session,
        optional: injection.metadata.optional,
      });
    },
  );
}
