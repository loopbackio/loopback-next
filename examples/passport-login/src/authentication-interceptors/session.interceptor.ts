// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Interceptor, InvocationContext, Next, Provider} from '@loopback/core';
import {RequestContext, RestBindings} from '@loopback/rest';
import {SecurityBindings} from '@loopback/security';
import {mapProfile} from '../authentication-strategies/types';
import {User} from '../models';

export class SessionAuth implements Provider<Interceptor> {
  constructor() {}

  value() {
    return async (invocationCtx: InvocationContext, next: Next) => {
      const requestCtx = invocationCtx.getSync<RequestContext>(
        RestBindings.Http.CONTEXT,
      );
      const request = requestCtx.request;
      if (request.user) {
        const user: User = request.user as User;
        requestCtx.bind(SecurityBindings.USER).to(mapProfile(user));
      }
      return next();
    };
  }
}
