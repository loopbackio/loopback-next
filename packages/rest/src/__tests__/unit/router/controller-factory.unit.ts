// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {
  createControllerFactoryForBinding,
  createControllerFactoryForClass,
  createControllerFactoryForInstance,
} from '../../..';

describe('createControllerFactory', () => {
  let ctx: Context;

  beforeEach(() => {
    ctx = new Context();
  });

  it('creates a factory with binding key', async () => {
    ctx.bind('controllers.my-controller').toClass(MyController);
    const factory = createControllerFactoryForBinding<MyController>(
      'controllers.my-controller',
    );
    const inst = await factory(ctx);
    expect(inst).to.be.instanceof(MyController);
  });

  it('creates a factory with class', async () => {
    const factory = createControllerFactoryForClass(MyController);
    const inst = await factory(ctx);
    expect(inst).to.be.instanceof(MyController);
  });

  it('creates a factory with an instance', async () => {
    const factory = createControllerFactoryForInstance(new MyController());
    const inst = await factory(ctx);
    expect(inst).to.be.instanceof(MyController);
  });

  class MyController {
    greet() {
      return 'Hello';
    }
  }
});
