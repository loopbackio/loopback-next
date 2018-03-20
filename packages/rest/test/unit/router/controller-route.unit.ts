// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ControllerRoute} from '../../..';
import {expect} from '@loopback/testlab';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {ControllerFactory, createControllerFactory} from '../../..';

describe('ControllerRoute', () => {
  it('rejects routes with no methodName', () => {
    const spec = anOperationSpec().build();

    expect(
      () => new ControllerRoute('get', '/greet', spec, MyController),
    ).to.throw(/methodName must be provided.*"get \/greet".*MyController/);
  });

  it('creates a factory', () => {
    const spec = anOperationSpec().build();

    const route = new MyRoute('get', '/greet', spec, MyController, 'greet');

    expect(route._controllerFactory).to.be.a.Function();
  });

  it('honors a factory', () => {
    const spec = anOperationSpec().build();

    const factory = createControllerFactory<MyController>(
      'controllers.my-controller',
    );
    const route = new MyRoute(
      'get',
      '/greet',
      spec,
      MyController,
      'greet',
      factory,
    );

    expect(route._controllerFactory).to.be.exactly(factory);
  });

  it('infers controllerName from the class', () => {
    const spec = anOperationSpec().build();

    const route = new MyRoute('get', '/greet', spec, MyController, 'greet');

    expect(route._controllerName).to.eql(MyController.name);
  });

  it('honors controllerName from the spec', () => {
    const spec = anOperationSpec().build();
    spec['x-controller-name'] = 'my-controller';

    const route = new MyRoute('get', '/greet', spec, MyController, 'greet');

    expect(route._controllerName).to.eql('my-controller');
  });

  class MyController {
    greet() {
      return 'Hello';
    }
  }

  class MyRoute extends ControllerRoute<MyController> {
    _controllerFactory: ControllerFactory<MyController>;
    _controllerName: string;
  }
});
