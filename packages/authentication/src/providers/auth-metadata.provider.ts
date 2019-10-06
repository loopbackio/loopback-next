// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, Constructor, inject, Provider} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {getAuthenticateMetadata} from '../decorators';
import {AuthenticationBindings} from '../keys';
import {AuthenticationMetadata, AuthenticationOptions} from '../types';

/**
 * Provides authentication metadata of a controller method
 * @example `context.bind('authentication.operationMetadata').toProvider(AuthMetadataProvider)`
 */
export class AuthMetadataProvider
  implements Provider<AuthenticationMetadata | undefined> {
  constructor(
    @inject(CoreBindings.CONTROLLER_CLASS, {optional: true})
    private readonly controllerClass: Constructor<{}>,
    @inject(CoreBindings.CONTROLLER_METHOD_NAME, {optional: true})
    private readonly methodName: string,
    @config({fromBinding: AuthenticationBindings.COMPONENT})
    private readonly options: AuthenticationOptions = {},
  ) {}

  /**
   * @returns AuthenticationMetadata
   */
  value(): AuthenticationMetadata | undefined {
    if (!this.controllerClass || !this.methodName) return;
    const metadata = getAuthenticateMetadata(
      this.controllerClass,
      this.methodName,
    );
    // Skip authentication if `skip` is `true`
    if (metadata && metadata.skip) return undefined;
    if (metadata) return metadata;
    // Fall back to default metadata
    return this.options.defaultMetadata;
  }
}
