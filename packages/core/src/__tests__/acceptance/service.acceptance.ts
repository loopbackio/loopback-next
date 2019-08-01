// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Context} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {CoreTags, service} from '../..';
import {asService} from '../../service';

describe('@service', () => {
  let ctx: Context;
  let myServiceBinding: Binding<MyService>;

  beforeEach(givenContextWithMyService);

  it('injects a service instance using constructor with serviceInterface argument', async () => {
    class MyController {
      constructor(@service(MyService) public myService: MyService) {}
    }
    ctx.bind('controllers.MyController').toClass(MyController);

    const controller = await ctx.get<MyController>('controllers.MyController');
    expect(controller.myService).to.be.instanceOf(MyService);
  });

  it('injects a service instance using property', async () => {
    class MyController {
      @service(MyService) public myService: MyService;
    }
    ctx.bind('controllers.MyController').toClass(MyController);

    const controller = await ctx.get<MyController>('controllers.MyController');
    expect(controller.myService).to.be.instanceOf(MyService);
  });

  it('injects a service instance without serviceInterface argument', async () => {
    class MyController {
      constructor(@service() public myService: MyService) {}
    }
    ctx.bind('controllers.MyController').toClass(MyController);

    const controller = await ctx.get<MyController>('controllers.MyController');
    expect(controller.myService).to.be.instanceOf(MyService);
  });

  it('injects a service instance matching a sub class', async () => {
    class MyController {
      constructor(@service(MyService) public myService: MyService) {}
    }
    ctx.unbind('services.MyService');
    ctx
      .bind('services.MySubService')
      .toClass(MySubService)
      .apply(asService(MyService));
    ctx.bind('controllers.MyController').toClass(MyController);

    const controller = await ctx.get<MyController>('controllers.MyController');
    expect(controller.myService).to.be.instanceOf(MySubService);
  });

  it('allows optional flag', async () => {
    class MyController {
      constructor(
        @service(MyService, {optional: true}) public myService?: MyService,
      ) {}
    }

    ctx.unbind('services.MyService');
    ctx.bind('controllers.MyController').toClass(MyController);

    const controller = await ctx.get<MyController>('controllers.MyController');
    expect(controller.myService).to.be.undefined();
  });

  it('allows serviceInterface as a string', async () => {
    class MyController {
      constructor(@service('MyService') public myService: MyService) {}
    }

    myServiceBinding.tag({[CoreTags.SERVICE_INTERFACE]: 'MyService'});
    ctx.bind('controllers.MyController').toClass(MyController);

    const controller = await ctx.get<MyController>('controllers.MyController');
    expect(controller.myService).to.be.instanceOf(MyService);
  });

  it('reports error if serviceInterface not found - string', async () => {
    class MyController {
      constructor(@service('MyService') public myService: MyService) {}
    }

    ctx.bind('controllers.MyController').toClass(MyController);

    return expect(
      ctx.get<MyController>('controllers.MyController'),
    ).to.be.rejectedWith(/No binding found for MyService/);
  });

  it('allows serviceInterface as a symbol', async () => {
    const MyServiceInterface = Symbol('MyService');
    class MyController {
      constructor(@service(MyServiceInterface) public myService: MyService) {}
    }

    myServiceBinding.tag({[CoreTags.SERVICE_INTERFACE]: MyServiceInterface});
    ctx.bind('controllers.MyController').toClass(MyController);

    const controller = await ctx.get<MyController>('controllers.MyController');
    expect(controller.myService).to.be.instanceOf(MyService);
  });

  it('reports error if serviceInterface not found - symbol', async () => {
    const MyServiceInterface = Symbol('MyService');
    class MyController {
      constructor(@service(MyServiceInterface) public myService: MyService) {}
    }

    ctx.bind('controllers.MyController').toClass(MyController);

    return expect(
      ctx.get<MyController>('controllers.MyController'),
    ).to.be.rejectedWith(/No binding found for Symbol\(MyService\)/);
  });

  it('throws error if no binding is found', async () => {
    class MyController {
      constructor(@service(MyService) public myService?: MyService) {}
    }

    ctx.unbind('services.MyService');
    ctx.bind('controllers.MyController').toClass(MyController);

    await expect(
      ctx.get<MyController>('controllers.MyController'),
    ).to.be.rejectedWith(
      /No binding found for MyService. Make sure a service binding is created in context .+ with serviceInterface \(MyService\)\./,
    );
  });

  it('throws error when more than one services are bound', async () => {
    class MyController {
      constructor(@service() public myService: MyService) {}
    }

    ctx.bind('services.MyService2').toClass(MyService);
    ctx.bind('controllers.MyController').toClass(MyController);

    await expect(
      ctx.get<MyController>('controllers.MyController'),
    ).to.be.rejectedWith(/More than one bindings found for MyService/);
  });

  it('throws error if the parameter type cannot be inferred', async () => {
    class MyController {
      constructor(@service() public myService: unknown) {}
    }

    ctx.bind('controllers.MyController').toClass(MyController);

    await expect(
      ctx.get<MyController>('controllers.MyController'),
    ).to.be.rejectedWith(
      /Service class cannot be inferred from design type. Use @service\(ServiceClass\)/,
    );
  });

  it('throws error if the property type cannot be inferred', async () => {
    class MyController {
      @service() public myService: string[];
    }

    ctx.bind('controllers.MyController').toClass(MyController);

    await expect(
      ctx.get<MyController>('controllers.MyController'),
    ).to.be.rejectedWith(/Service class cannot be inferred from design type/);
  });

  class MyService {}

  class MySubService extends MyService {}

  function givenContextWithMyService() {
    ctx = new Context();
    myServiceBinding = ctx.bind('services.MyService').toClass(MyService);
  }
});
