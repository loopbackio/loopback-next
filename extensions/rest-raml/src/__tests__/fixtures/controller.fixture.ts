import {get} from '@loopback/rest';

export class PingController {
  @get('/ping')
  async pingFunction(): Promise<string> {
    return 'pong';
  }
}
