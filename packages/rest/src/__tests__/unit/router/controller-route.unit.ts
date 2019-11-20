// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, Context, CoreBindings} from '@loopback/core';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {
  ControllerFactory,
  ControllerRoute,
  createControllerFactoryForBinding,
  createControllerFactoryForClass,
  RestBindings,
  RouteSource,
} from '../../..';

describe('ControllerRoute', () => {
  it('rejects routes with no methodName', () => {
    const spec = anOperationSpec().build();

    expect(
      () => new ControllerRoute('get', '/greet', spec, MyController),
    ).to.throw(/methodName must be provided.*"get \/greet".*MyController/);
  });

  it('creates a factory', () => {
    const spec = anOperationSpec().build();

    const route = new MyRoute(
      'get',
      '/greet',
      spec,
      MyController,
      myControllerFactory,
      'greet',
    );

    expect(route._controllerFactory).to.be.a.Function();
  });

  it('honors a factory', () => {
    const spec = anOperationSpec().build();

    const factory = createControllerFactoryForBinding<MyController>(
      'controllers.my-controller',
    );
    const route = new MyRoute(
      'get',
      '/greet',
      spec,
      MyController,
      factory,
      'greet',
    );

    expect(route._controllerFactory).to.be.exactly(factory);
  });

  it('infers controllerName from the class', () => {
    const spec = anOperationSpec().build();

    const route = new MyRoute(
      'get',
      '/greet',
      spec,
      MyController,
      myControllerFactory,
      'greet',
    );

    expect(route._controllerName).to.eql(MyController.name);
  });

  it('honors controllerName from the spec', () => {
    const spec = anOperationSpec().build();
    spec['x-controller-name'] = 'my-controller';

    const route = new MyRoute(
      'get',
      '/greet',
      spec,
      MyController,
      myControllerFactory,
      'greet',
    );

    expect(route._controllerName).to.eql('my-controller');
  });

  it('implements toString', () => {
    const spec = anOperationSpec().build();
    const route = new MyRoute(
      'get',
      '/greet',
      spec,
      MyController,
      myControllerFactory,
      'greet',
    );
    expect(route.toString()).to.equal('MyRoute - get /greet');
    expect(new RouteSource(route).toString()).to.equal('get /greet');
  });

  describe('updateBindings()', () => {
    let appCtx: Context;
    let requestCtx: Context;

    before(givenContextsAndControllerRoute);

    it('adds bindings to the request context', async () => {
      expect(requestCtx.contains(CoreBindings.CONTROLLER_CURRENT));
      expect(
        requestCtx.getBinding(CoreBindings.CONTROLLER_CURRENT).scope,
      ).to.equal(BindingScope.SINGLETON);
      expect(await requestCtx.get(CoreBindings.CONTROLLER_CLASS)).to.equal(
        MyController,
      );
      expect(
        await requestCtx.get(CoreBindings.CONTROLLER_METHOD_NAME),
      ).to.equal('greet');
      expect(await requestCtx.get(RestBindings.OPERATION_SPEC_CURRENT)).to.eql({
        'x-controller-name': 'MyController',
        'x-operation-name': 'greet',
        tags: ['MyController'],
        responses: {'200': {description: 'An undocumented response body.'}},
      });
    });

    it('binds current controller to the request context as singleton', async () => {
      const controller1 = await requestCtx.get(CoreBindings.CONTROLLER_CURRENT);
      expect(controller1).instanceOf(MyController);

      const controller2 = await requestCtx.get(CoreBindings.CONTROLLER_CURRENT);
      expect(controller2).to.be.exactly(controller1);

      const childCtx = new Context(requestCtx);
      const controller3 = await childCtx.get(CoreBindings.CONTROLLER_CURRENT);
      expect(controller3).to.be.exactly(controller1);

      await expect(
        appCtx.get(CoreBindings.CONTROLLER_CURRENT),
      ).to.be.rejectedWith(/The key .+ is not bound to any value/);
    });

    function givenContextsAndControllerRoute() {
      const spec = anOperationSpec().build();

      const route = new MyRoute(
        'get',
        '/greet',
        spec,
        MyController,
        myControllerFactory,
        'greet',
      );

      appCtx = new Context('application');
      requestCtx = new Context(appCtx, 'request');
      route.updateBindings(requestCtx);
    }
  });

  class MyController {
    greet() {
      return 'Hello';
    }
  }

  const myControllerFactory = createControllerFactoryForClass(MyController);

  class MyRoute extends ControllerRoute<MyController> {
    _controllerFactory: ControllerFactory<MyController>;
    _controllerName: string;
  }
});
