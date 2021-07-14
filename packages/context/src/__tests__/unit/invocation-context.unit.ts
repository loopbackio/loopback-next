// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject, InvocationContext} from '../..';

describe('InvocationContext', () => {
  let ctx: Context;
  let invocationCtxForGreet: InvocationContext;
  let invocationCtxForHello: InvocationContext;
  let invocationCtxForCheckName: InvocationContext;
  let invalidInvocationCtx: InvocationContext;
  let invalidInvocationCtxForStaticMethod: InvocationContext;

  before(givenContext);
  before(givenInvocationContext);

  it('has a getter for targetClass', () => {
    expect(invocationCtxForGreet.targetClass).to.equal(MyController);
    expect(invocationCtxForCheckName.targetClass).to.equal(MyController);
  });

  it('has a getter for targetName', () => {
    expect(invocationCtxForGreet.targetName).to.equal(
      'MyController.prototype.greet',
    );
    expect(invocationCtxForCheckName.targetName).to.equal(
      'MyController.checkName',
    );
  });

  it('has a getter for description', () => {
    expect(invocationCtxForGreet.description).to.equal(
      `InvocationContext(${invocationCtxForGreet.name}): MyController.prototype.greet`,
    );
    expect(invocationCtxForCheckName.description).to.equal(
      `InvocationContext(${invocationCtxForCheckName.name}): MyController.checkName`,
    );
  });

  it('has public access to parent context', () => {
    expect(invocationCtxForGreet.parent).to.equal(ctx);
  });

  it('throws error if method does not exist', () => {
    expect(() => invalidInvocationCtx.assertMethodExists()).to.throw(
      'Method MyController.prototype.invalid-method not found',
    );

    expect(() =>
      invalidInvocationCtxForStaticMethod.assertMethodExists(),
    ).to.throw('Method MyController.invalid-static-method not found');
  });

  it('invokes target method', async () => {
    expect(await invocationCtxForGreet.invokeTargetMethod()).to.eql(
      'Hello, John',
    );
    expect(invocationCtxForCheckName.invokeTargetMethod()).to.eql(true);
  });

  it('invokes target method with injection', async () => {
    expect(
      await invocationCtxForHello.invokeTargetMethod({
        skipParameterInjection: false,
      }),
    ).to.eql('Hello, Jane');
  });

  it('does not close when an interceptor is in processing', () => {
    const result = invocationCtxForGreet.invokeTargetMethod();
    expect(invocationCtxForGreet.isBound('abc'));
    return result;
  });

  class MyController {
    static checkName(name: string) {
      const firstLetter = name.substring(0, 1);
      return firstLetter === firstLetter.toUpperCase();
    }

    async greet(name: string) {
      return `Hello, ${name}`;
    }

    async hello(@inject('name') name: string) {
      return `Hello, ${name}`;
    }
  }

  function givenContext() {
    ctx = new Context();
    ctx.bind('abc').to('xyz');
  }

  function givenInvocationContext() {
    invocationCtxForGreet = new InvocationContext(
      ctx,
      new MyController(),
      'greet',
      ['John'],
    );

    invocationCtxForHello = new InvocationContext(
      ctx,
      new MyController(),
      'hello',
      [],
    );
    invocationCtxForHello.bind('name').to('Jane');

    invocationCtxForCheckName = new InvocationContext(
      ctx,
      MyController,
      'checkName',
      ['John'],
    );

    invalidInvocationCtx = new InvocationContext(
      ctx,
      new MyController(),
      'invalid-method',
      ['John'],
    );

    invalidInvocationCtxForStaticMethod = new InvocationContext(
      ctx,
      MyController,
      'invalid-static-method',
      ['John'],
    );
  }
});
