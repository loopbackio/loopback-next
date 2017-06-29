// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  HttpHandler,
  bindElement,
  getFromContext,
  InvokeMethod,
  ResolvedRoute,
  OperationRetval,
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
        const fn: bindElement = await requestContext.get('bindElement');
        const binding: Binding = fn('foo').to('bar');
        expect(binding).to.be.instanceof(Binding);
      });
    });
    describe('getFromContext()', () => {
      it('returns a value from the context', async () => {
        requestContext.bind('foo').to('bar');
        const fn: getFromContext = await requestContext.get('getFromContext');
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

        requestContext.bind('test-controller').toClass(HelloController);
        const fn: InvokeMethod = await requestContext.get('invokeMethod');
        const route: ResolvedRoute = {
          controllerName: 'test-controller',
          methodName: 'hello',
          spec: anOperationSpec().withStringResponse(200).build(),
          pathParams: [],
        };
        const val: OperationRetval = await fn(route, []);
        expect(val).to.eql('hello');
      });

      it('invokes a route handler', async () => {
        const fn: InvokeMethod = await requestContext.get('invokeMethod');
        const route: ResolvedRoute = {
          handler: () => Promise.resolve('hello'),
          spec: anOperationSpec().withStringResponse(200).build(),
          pathParams: [],
        };
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
