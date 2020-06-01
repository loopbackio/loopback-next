// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Request,
  RestBindings,
  get,
  RequestBodyObject,
  SchemaObject,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {SecurityBindings, UserProfile} from '@loopback/security';

const HEADER_SCHEMA: SchemaObject = {
  type: 'object',
  properties: {
    'Content-Type': {type: 'string'},
  },
  additionalProperties: true,
};

const PING_RESPONSE: RequestBodyObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          headers: HEADER_SCHEMA,
        },
      },
    },
  },
};

const USER_PROFILE_RESPONSE: RequestBodyObject = {
  description: 'Session user profile',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'sessionUserProfile',
        properties: {
          user: {type: 'object'},
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  @get('/ping', {
    responses: PING_RESPONSE,
  })
  ping(): object {
    return {
      headers: Object.assign({}, this.req.headers),
    };
  }

  @authenticate('session')
  @get('/whoAmI', {
    responses: USER_PROFILE_RESPONSE,
  })
  whoAmI(@inject(SecurityBindings.USER) user: UserProfile): object {
    /**
     * controller returns back currently logged in user information
     */
    return {
      user: user.profile,
      headers: Object.assign({}, this.req.headers),
    };
  }
}
