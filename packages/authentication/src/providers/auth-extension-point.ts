// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ExtensionPoint, Context} from '@loopback/core';
import {ParsedRequest} from '@loopback/rest';
import {
  UserProfile,
  AuthenticationMetadata,
  Authenticator,
} from '../authentication';
import {AuthenticationBindings} from '../keys';

export class AuthenticationExtensionPoint extends ExtensionPoint<
  Authenticator
> {
  static extensionPointName = 'authenticators';

  async authenticate(
    ctx: Context,
    request: ParsedRequest,
  ): Promise<UserProfile | undefined> {
    const meta: AuthenticationMetadata | undefined = await ctx.get(
      AuthenticationBindings.METADATA,
    );
    if (meta == undefined) {
      return undefined;
    }
    const authenticators = await this.getAllExtensions(ctx);
    let user: UserProfile | undefined = undefined;
    for (const authenticator of authenticators) {
      if (authenticator.isSupported(meta.strategy)) {
        user = await authenticator.authenticate(request, meta);
        if (user === undefined) continue;
      }
    }
    return user;
  }
}
