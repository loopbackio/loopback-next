// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKeys} from '@loopback/core';
import {Constructor, Provider, inject} from '@loopback/context';
import {AuthenticationMetadata, getAuthenticateMetadata} from './decorator';

/**
 * @description Provides authentication metadata of a controller method
 * @example `context.bind('authentication.meta')
 *   .toProvider(AuthMetadataProvider)`
 */
export class AuthMetadataProvider
  implements Provider<AuthenticationMetadata | undefined> {
  constructor(
    @inject(BindingKeys.Context.CONTROLLER_CLASS)
    private readonly controllerClass: Constructor<{}>,
    @inject(BindingKeys.Context.CONTROLLER_METHOD_NAME)
    private readonly methodName: string,
  ) {}

  /**
   * @returns AuthenticationMetadata
   */
  value(): AuthenticationMetadata | undefined {
    return getAuthenticateMetadata(this.controllerClass, this.methodName);
  }
}
