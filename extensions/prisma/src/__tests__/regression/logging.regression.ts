import {PrismaClient} from '.prisma/client';
import {Application, BindingType} from '@loopback/core';
import {LoggingBindings, LoggingComponent} from '@loopback/logging';
import {expect, sinon} from '@loopback/testlab';
import {PrismaComponent} from '../../';
import {PrismaBindings} from '../../keys';
import {PrismaOptions} from '../../types';

describe('Prisma Component', () => {
  describe('Logging Integration', () => {
    it('does not disrupt `@loopback/logging` registration if it is initialized ahead', async () => {
      const app = new Application();
      const prismaClientStub = sinon.stub(new PrismaClient());
      app
        .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
        .to.bind(prismaClientStub as unknown as PrismaClient);
      app.configure<PrismaOptions>(PrismaBindings.COMPONENT).to({
        enableLoggingIntegration: true,
      });
      app.component(PrismaComponent);
      const prismaComponent = await app.get(PrismaBindings.COMPONENT);
      await prismaComponent.init();
      const winstonBindingBeforeReg = app.getBinding(
        LoggingBindings.WINSTON_LOGGER,
      );

      expect(winstonBindingBeforeReg.type).to.be.undefined();

      app.component(LoggingComponent);
      const winstonBindingAfterReg = app.getBinding(
        LoggingBindings.WINSTON_LOGGER,
      );

      expect(winstonBindingAfterReg.type).to.equal(BindingType.PROVIDER);
    });
  });
});
