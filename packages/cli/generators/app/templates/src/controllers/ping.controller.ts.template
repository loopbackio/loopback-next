import {ServerRequest} from '@loopback/rest';
import {get} from '@loopback/openapi-v2';
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
