// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  HttpHandler,
  BindElement,
  GetFromContext,
  InvokeMethod,
  ResolvedRoute,
  OperationRetval,
  ControllerRoute,
  Route,
} from '../..';
import {Context, Binding, BoundValue} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {anOperationSpec} from '@loopback/openapi-spec-builder';

describe('HttpHandler', () => {
  let requestContext: Context;
  let handler: TestHandler;
  beforeEach(givenHandler);

  describe('has inbuilt methods to inject into a request context', ()=> {
    beforeEach(setupRequestContext);
    describe('bindElement()', () => {
      it('returns a binding to a context', async () => {
        const fn: BindElement = await requestContext.get('bindElement');
        const binding: Binding = fn('foo').to('bar');
        expect(binding).to.be.instanceof(Binding);
      });
    });

    describe('getFromContext()', () => {
      it('returns a value from the context', async () => {
        requestContext.bind('foo').to('bar');
        const fn: GetFromContext = await requestContext.get('getFromContext');
        const val: BoundValue = await fn('foo');
        expect(val).to.eql('bar');
      });
    });

    describe('invokeMethod()', () => {
      it('invokes a controller method', async () => {
        class HelloController {
          async hello(): Promise<string> {
            return 'hello';
          }
        }

        requestContext.bind('controllers.test-controller')
          .toClass(HelloController);
        const fn: InvokeMethod = await requestContext.get(
          'sequence.actions.invokeMethod',
        );
        const spec = anOperationSpec()
          .withStringResponse(200)
          .withOperationName('hello')
          .build();
        const route = new ControllerRoute('get', '/', spec, HelloController);
        const val: OperationRetval = await fn(route, []);
        expect(val).to.eql('hello');
      });

      it('invokes a route handler', async () => {
        const fn: InvokeMethod = await requestContext.get(
          'sequence.actions.invokeMethod',
        );
        const spec = anOperationSpec().withStringResponse(200).build();
        function hello() { return 'hello'; }
        const route = new Route('get', '/', spec, hello);
        const val: OperationRetval = await fn(route, []);
        expect(val).to.eql('hello');
      });
    });
  });

  function givenHandler() {
    const rootContext = new Context();
    requestContext = new Context(rootContext);
    handler = new TestHandler(rootContext);
  }
  function setupRequestContext() {
    handler._bindBindElement(requestContext);
    handler._bindGetFromContext(requestContext);
    handler._bindInvokeMethod(requestContext);
  }
});

class TestHandler extends HttpHandler {
  constructor(context: Context) {
    super(context);
  }
  public _bindBindElement(context: Context) {
    super._bindBindElement(context);
  }
  public _bindGetFromContext(context: Context) {
    super._bindGetFromContext(context);
  }
  public _bindFindRoute(context: Context) {
    super._bindFindRoute(context);
  }
  public _bindInvokeMethod(context: Context) {
    super._bindInvokeMethod(context);
  }
}
