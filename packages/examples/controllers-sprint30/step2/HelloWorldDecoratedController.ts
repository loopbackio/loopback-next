//////////////////////////////////////////////////////
// STEP 2:
//  - use decorators to provide remoting metadata
//  - no context/DI integration yet
//////////////////////////////////////////////////////

import {controller, endpoint, response, param} from '@loopback/controllers';

@controller('/hello-world-step2' /* <- the base URL of this controller */)
export class HelloWorldController {

  // This syntax allows developers to add arbitrary swagger extensions to parameter definitions
  // @endpoint('GET', '/hello', { 'x-my-swagger-extension': value })
  // @param('greeter', { in: 'query', 'x-my-swagger-extension': value })
  // @response(200, { type: 'string', 'x-my-swagger-extension': value })
  @endpoint('GET', '/hello')
  @param('greeter', { in: 'query', required: true})
  @response(200, { type: 'string' })
  // @param('greeter') greeter is referencing the parameter defined above
  // AFAIK(Miroslav), there is no way how to get the parameter name at runtime,
  // developers have to explicitly provide the name
  public async hello(@param('greeter') greeter: string): Promise<string> {
    return `Hello world from {greeter}!`;
  }

  // we could define parameters inline, but that would produce very long functions,
  // making it difficult to work out what's the actual TS/JS API
  @endpoint('GET', '/hello2')
  @response(200, { type: 'string' })
  public async hello2(
     @param('greeter', { in: 'query', 'x-my-swagger-extension': value }) greeter: string
  ): Promise<string> {
    return `Hello world from {greeter}!`;
  }
}
