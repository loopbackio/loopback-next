// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {Constructor, Provider, inject} from '@loopback/context';
import {AuthenticationMetadata, getAuthenticateMetadata} from '../decorators';

/**
 * @description Provides authentication metadata of a controller method
 * @example `context.bind('authentication.meta')
 *   .toProvider(AuthMetadataProvider)`
 */
export class AuthMetadataProvider
  implements Provider<AuthenticationMetadata | undefined> {
  constructor(
    @inject(CoreBindings.CONTROLLER_CLASS, {optional: true})
    private readonly controllerClass: Constructor<{}>,
    @inject(CoreBindings.CONTROLLER_METHOD_NAME, {optional: true})
    private readonly methodName: string,
  ) {}

  /**
   * @returns AuthenticationMetadata
   */
  value(): AuthenticationMetadata | undefined {
    if (!this.controllerClass || !this.methodName) return;
    return getAuthenticateMetadata(this.controllerClass, this.methodName);
  }
}
