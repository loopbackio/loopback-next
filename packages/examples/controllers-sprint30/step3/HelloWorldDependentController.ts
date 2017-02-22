//////////////////////////////////////////////////////
// STEP 2:
//  - integrate with context/DI
//  - inject only controller constructor arguments
//  - method parameters cannot be injected yet
//////////////////////////////////////////////////////

import {controller, endpoint, response} from '@loopback/controllers';

// Similarly to remoting decorators, the @inject decorator should live in a small package
// that 3rd party components can depend upon.
// Initially, I was thinking about "@loopback/ioc", but on the second thought, I decided
// it will be better for "@loopback/controllers" to provide it alongside other decorators.
// This will allow us to provide controller-specific implementation of dependency injection.
// I anticipate this will be needed in order to support mixed parameters like
//   find(@param('filter', { in: 'query' } filter, @inject('request.accessToken') accessToken) {
//      // return records matching "filter" but only those which accessToken is authorized to access
//   }
import {inject} from '@loopback/controllers';

type Headers = { [key: string]: any };

@controller('/hello-world-step3')
export class HelloWorldController {
  // If per-request context is not available by the time I get to implement this feature,
  // then we can replace "request.headers" with an app-wide value, for example
  // app.ctx.bind('startTime').to(Date.now());
  constructor(@inject('request.headers') protected readonly _headers: Headers) {
  }

  @endpoint('GET', '/headers')
  @response(200, { type: 'object', additionalProperties: true })
  public async showRequestHeaders(): Promise<Headers> {
    return this._headers;
  }
}
