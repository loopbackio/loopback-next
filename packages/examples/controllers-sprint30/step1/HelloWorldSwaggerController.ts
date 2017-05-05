//////////////////////////////////////////////////////
// STEP 1:
//  - use swagger-like metadata in controller def
//  - focus on implementing the router
//  - no context/DI integration yet
//////////////////////////////////////////////////////

// The file name matches the exported class (HelloWorldSwaggerController is defined in HelloWorldSwaggerController.ts)
// This is the convention used in C# and Java too.
// Alternatively, we can consider adopting Angular2's style, where they use lowercase letters
// and dots - "hello-world-swagger.controller.ts" - see https://angular.io/styleguide#!#02-02
// However, I think Angular2's style is ambiguous - how to transform multi-word class name like "HelloWorldSwaggerController"?

// Notice that decorators are provided by a sub-package
// This will allow 3rd party components to provide custom controllers
// while not depending on full loopback core
import {controller} from '@loopback/controllers';

// In real-world apps, the swagger object will be loaded from an external file, e.g. via
// ```
// @controller(yaml.parse(
//    fs.readFileSync(
//      path.resolve(__dirname, __filename.replace(/\.[^.]*$/, '.swagger.yaml'))))
// ```
// (LoopBack should provide a helper for that.)
const swaggerSpec = {
  basePath: '/hello-world-step1',
  paths: {
    '/hello': {
      get: {
        'x-operation-name': 'hello',
        parameters: {
          name: 'greeter',
          in: 'query',
          description: 'Name of the person greeting the world.',
          required: true,
          type: 'string',
        },
        responses: {
          200: {
            schema: { type: 'string' },
          },
        },
      },
    },
  },
};

// Notice that the controler is not required to extend any Controller base class
@controller(swaggerSpec)
export class HelloWorldSwaggerController {

  // Remote methods are returning a Promise and should be implemented as async functions
  public async hello(greeter: string): Promise<string> {
    return `Hello world from {greeter}!`;
  }
}
