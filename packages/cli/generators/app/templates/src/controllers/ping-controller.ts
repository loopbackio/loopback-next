// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: <%= project.name %>
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get, ServerRequest} from '@loopback/rest';
import {inject} from '@loopback/context';

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject('rest.http.request') private req: ServerRequest) {}

  // Map to `GET /ping`
  @get('/ping')
  ping(): object {
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }
}
