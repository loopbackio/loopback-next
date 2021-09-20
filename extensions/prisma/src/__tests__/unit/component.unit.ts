// Copyright The LoopBack Authors 2021. All Rights Reserved.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {PrismaClient} from '.prisma/client';
import {Application} from '@loopback/core';
import {expect, sinon} from '@loopback/testlab';
import assert from 'assert';
import {PrismaComponent} from '../..';

describe('Prisma Component', () => {
  let app: Application;
  let prismaClientStub: sinon.SinonStubbedInstance<PrismaClient>;
  let component: PrismaComponent;

  beforeEach(givenAppAndComponentAndStubbedPrismaClient);

  it('calls PrismaClient.$connect() during lifecycle start', async () => {
    await component.init();
    await component.start();
    assert(prismaClientStub.$connect.calledOnce);
  });

  it('does not call PrismaClient.$connect during lifecycle start when lazyConnect = true', async () => {
    // We need a custom initialized component for this test.
    const localComponent = new PrismaComponent(new Application(), undefined, {
      lazyConnect: true,
    });
    await localComponent.init();
    await localComponent.start();
    assert(prismaClientStub.$connect.notCalled);
  });

  it('calls PrismaClient.$disconnect during lifecycle stop', async () => {
    await component.init();
    await component.stop();
    assert(prismaClientStub.$disconnect.calledOnce);
  });

  it('Sets isInitialized after init() is called.', async () => {
    await component.init();
    assert(component.isInitialized === true);
  });

  it('Rejects `prismaClient` configuration when existing Prisma Client instance is provided', async () => {
    // We need a custom initialized component for this test.
    const localComponentFactory = () =>
      new PrismaComponent(
        new Application(),
        (<unknown>prismaClientStub) as PrismaClient,
        {
          prismaClient: {
            errorFormat: 'pretty',
          },
        },
      );

    expect(localComponentFactory).to.throw();
  });

  function givenAppAndComponentAndStubbedPrismaClient() {
    app = new Application();
    prismaClientStub = sinon.stub(new PrismaClient());
    component = new PrismaComponent(
      app,
      (<unknown>prismaClientStub) as PrismaClient,
    );
  }
});
