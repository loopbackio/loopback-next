// Copyright The LoopBack Authors 2021.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  BindingKey,
  BindingScope,
  BindingType,
  Provider,
} from '@loopback/core';
import {expect, sinon} from '@loopback/testlab';
import {Prisma, PrismaClient} from '@prisma/client';
import {PrismaComponent} from '../..';
import {asPrismaMiddleware} from '../../helpers';
import {PrismaBindings} from '../../keys';
import {DEFAULT_PRISMA_OPTIONS, PrismaOptions} from '../../types';

describe('Prisma Component', () => {
  describe('Dependency Injection Integration', () => {
    let app: Application;
    let prismaClientStub: sinon.SinonStubbedInstance<PrismaClient>;

    describe('Prisma Client middleware registration', () => {
      beforeEach(givenAppAndBoundStubbedPrismaClient);
      afterEach(sinon.restore);

      it('adds middleware backlog during initialization and locks bindings', async () => {
        const bindingPreInit1 = givenBlankPrismaMiddlewareBinding();
        const bindingPreInit2 = givenBlankPrismaMiddlewareBinding();
        app.add(bindingPreInit1);
        app.add(bindingPreInit2);
        app.component(PrismaComponent);
        await app.init();
        expect(prismaClientStub.$use.callCount).to.be.equal(2);
        expect(bindingPreInit1.isLocked).to.be.true();
        expect(bindingPreInit2.isLocked).to.be.true();
      });

      it('adds middleware after initialization before start and locks bindings', async () => {
        const bindingPreStart1 = givenBlankPrismaMiddlewareBinding();
        const bindingPreStart2 = givenBlankPrismaMiddlewareBinding();
        app.component(PrismaComponent);
        await app.init();
        app.add(bindingPreStart1);
        app.add(bindingPreStart2);
        await new Promise(resolve => process.nextTick(resolve));
        expect(prismaClientStub.$use.callCount).to.be.equal(2);
        expect(bindingPreStart1.isLocked).to.be.true();
        expect(bindingPreStart2.isLocked).to.be.true();
      });

      it('adds middleware after start and locks bindings', async () => {
        const bindingPostStart1 = givenBlankPrismaMiddlewareBinding();
        const bindingPostStart2 = givenBlankPrismaMiddlewareBinding();
        app.component(PrismaComponent);
        await app.start();
        app.add(bindingPostStart1);
        app.add(bindingPostStart2);
        await new Promise(resolve => process.nextTick(resolve));
        expect(prismaClientStub.$use.callCount).to.be.equal(2);
        expect(bindingPostStart1.isLocked).to.be.true();
        expect(bindingPostStart2.isLocked).to.be.true();
      });

      describe('Invalid Bindings', () => {
        for (const bindingScope of Object.values(BindingScope))
          if (bindingScope !== BindingScope.SINGLETON) {
            it(`rejects ${bindingScope} bindings during registration`, async () => {
              const binding = givenBlankPrismaMiddlewareBinding().inScope(
                bindingScope as BindingScope,
              );
              app.add(binding);
              expect(() => app.component(PrismaComponent)).to.throw();
            });

            // it(`rejects ${bindingScope} bindings after registration`, async () => {
            //   const binding = givenBlankPrismaMiddlewareBinding().inScope(
            //     bindingScope as BindingScope,
            //   );
            //   app.component(PrismaComponent);
            //   expect(() => app.add(binding)).to.throw();
            // });

            // it(`rejects ${bindingScope} bindings after initialization`, async () => {
            //   const binding = givenBlankPrismaMiddlewareBinding().inScope(
            //     bindingScope as BindingScope,
            //   );
            //   app.component(PrismaComponent);
            //   await app.init();
            //   expect(() => app.add(binding)).to.throw();
            // });

            // it(`rejects ${bindingScope} bindings after start`, async () => {
            //   const binding = givenBlankPrismaMiddlewareBinding().inScope(
            //     bindingScope as BindingScope,
            //   );
            //   app.component(PrismaComponent);
            //   await app.start();
            //   expect(() => app.add(binding)).to.throw();
            // });

            // it(`rejects ${bindingScope} bindings after stop`, async () => {
            //   const binding = givenBlankPrismaMiddlewareBinding().inScope(
            //     bindingScope as BindingScope,
            //   );
            //   app.component(PrismaComponent);
            //   await app.start();
            //   await app.stop();
            //   expect(() => app.add(binding)).to.throw();
            // });
          }

        for (const bindingType of Object.values(BindingType))
          if (
            ![BindingType.CONSTANT, BindingType.PROVIDER].includes(bindingType)
          ) {
            const binding = givenBlankPrismaMiddlewareBinding();

            switch (bindingType) {
              case BindingType.ALIAS:
                binding.toAlias('aliasTarget');
                break;
              case BindingType.CLASS:
                (binding as Binding).toClass(class {});
                break;
              case BindingType.DYNAMIC_VALUE:
                (binding as Binding).toDynamicValue(() => {});
                break;
              default:
                throw new Error(
                  `Missing Binding Type ('${bindingType}') in test!`,
                );
            }

            it(`rejects ${bindingType} bindings during registration`, async () => {
              app.add(binding);
              expect(() => app.component(PrismaComponent)).to.throw();
            });

            // it(`rejects ${bindingType} bindings after registration`, async () => {
            //   app.component(PrismaComponent);
            //   expect(() => app.add(binding)).to.throw();
            // });

            // it(`rejects ${bindingType} bindings after initialization`, async () => {
            //   app.component(PrismaComponent);
            //   await app.init();
            //   expect(() => app.add(binding)).to.throw();
            // });

            // it(`rejects ${bindingType} bindings after start`, async () => {
            //   app.component(PrismaComponent);
            //   await app.start();
            //   expect(() => app.add(binding)).to.throw();
            // });

            // it(`rejects ${bindingType} bindings after stop`, async () => {
            //   app.component(PrismaComponent);
            //   await app.start();
            //   await app.stop();
            //   expect(() => app.add(binding)).to.throw();
            // });
          }
      });

      function givenBlankPrismaMiddlewareBinding() {
        return new Binding<Prisma.Middleware>(BindingKey.generate())
          .apply(asPrismaMiddleware)
          .to((params, next) => next(params));
      }
    });

    describe('Prisma Client instance', () => {
      beforeEach(givenApp);

      it('creates new locked singleton Prisma Client instance', async () => {
        app.component(PrismaComponent);
        await app.init();
        expect(
          app.getSync(PrismaBindings.PRISMA_CLIENT_INSTANCE),
        ).to.be.instanceOf(PrismaClient);
        expect(
          app.getBinding(PrismaBindings.PRISMA_CLIENT_INSTANCE).isLocked,
        ).to.be.true();
      });

      it('does not override existing singleton Prisma Client instance', async () => {
        app
          .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
          .to(new PrismaClient())
          .inScope(BindingScope.SINGLETON);
        const expectedPrismaClientInstance = app.getSync(
          PrismaBindings.PRISMA_CLIENT_INSTANCE,
        );
        app.component(PrismaComponent);
        await app.init();
        expect(app.getSync(PrismaBindings.PRISMA_CLIENT_INSTANCE)).to.equal(
          expectedPrismaClientInstance,
        );
      });

      it('reuses Prisma Client instance when initialized more than once', async () => {
        const component = new PrismaComponent(app);
        await component.init();
        const prismaClient1 = app.getSync(
          PrismaBindings.PRISMA_CLIENT_INSTANCE,
        );
        await component.init();
        const prismaClient2 = app.getSync(
          PrismaBindings.PRISMA_CLIENT_INSTANCE,
        );
        expect(prismaClient1).to.equal(prismaClient2);
      });

      it('locks existing singleton Prisma Client instance', async () => {
        app
          .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
          .to(new PrismaClient())
          .inScope(BindingScope.SINGLETON);
        app.component(PrismaComponent);
        await app.init();
        expect(
          app.getBinding(PrismaBindings.PRISMA_CLIENT_INSTANCE).isLocked,
        ).to.be.true();
      });

      it('rejects Prisma Client instance bound as alias', async () => {
        const customPrismaClientBindingKey = 'customPrismaClientBindingKey';
        const prismaClient = new PrismaClient();
        app
          .bind(customPrismaClientBindingKey)
          .to(prismaClient)
          .inScope(BindingScope.SINGLETON);

        app
          .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
          .toAlias(customPrismaClientBindingKey)
          .inScope(BindingScope.SINGLETON);
        app.component(PrismaComponent);
        await expect(app.init()).to.be.rejected();
      });

      it('rejects Prisma Client instance bound as dynamic value', async () => {
        const prismaClient = new PrismaClient();
        app
          .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
          .toDynamicValue(() => prismaClient)
          .inScope(BindingScope.SINGLETON);
        app.component(PrismaComponent);
        await expect(app.init()).to.be.rejected();
      });

      it('rejects Prisma Client instance bound as provider', async () => {
        class PrismaProvider implements Provider<PrismaClient> {
          private static _prismaClient = new PrismaClient();
          value() {
            return PrismaProvider._prismaClient;
          }
        }
        app
          .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
          .toProvider(PrismaProvider)
          .inScope(BindingScope.SINGLETON);
        app.component(PrismaComponent);
        await expect(app.init()).to.be.rejected();
      });
    });

    describe('Prisma Client Model', () => {
      beforeEach(givenApp);

      it('binds and locks Prisma Client Models', async () => {
        const prismaClient = new PrismaClient();
        app
          .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
          .to(prismaClient)
          .inScope(BindingScope.SINGLETON);
        app.component(PrismaComponent);
        await app.init();
        const modelBindings = app.find(
          `${PrismaBindings.PRISMA_MODEL_NAMESPACE}.*`,
        );

        for (const binding of modelBindings) {
          const model = await app.get(binding.key);
          const modelName = binding.key.split('.').pop();
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          expect(model).to.equal(prismaClient[modelName?.toLowerCase()]);
          expect(binding.isLocked).to.be.true();
        }
      });
    });

    describe('Component Configuration', () => {
      beforeEach(givenApp);

      it('binds default configuration if none provided', async () => {
        app.component(PrismaComponent);
        const config = await app.getConfig(PrismaBindings.COMPONENT);
        expect(config).to.deepEqual(DEFAULT_PRISMA_OPTIONS);
      });

      it('deep augments partial user-provided configuration', async () => {
        app.configure<PrismaOptions>(PrismaBindings.COMPONENT).to({
          prismaClient: {rejectOnNotFound: false},
          lazyConnect: true,
          models: {
            namespace: 'customNamespace',
          },
        });
        app.component(PrismaComponent);
        await app.init();
        await new Promise(resolve => process.nextTick(resolve));
        const config = await app.getConfig(PrismaBindings.COMPONENT);
        expect(config).to.deepEqual({
          prismaClient: {rejectOnNotFound: false},
          lazyConnect: true,
          models: {
            namespace: 'customNamespace',
            tags: [PrismaBindings.PRISMA_MODEL_TAG],
          },
        });
      });

      it('does not override user-provided configuration', async () => {
        app.configure<PrismaOptions>(PrismaBindings.COMPONENT).to({
          prismaClient: {rejectOnNotFound: false},
          lazyConnect: true,
          models: {
            namespace: 'customNamespace',
            tags: ['customPrismaTag'],
          },
        });
        app.component(PrismaComponent);
        await app.init();
        const config = await app.getConfig(PrismaBindings.COMPONENT);
        expect(config).to.deepEqual({
          prismaClient: {rejectOnNotFound: false},
          lazyConnect: true,
          models: {
            namespace: 'customNamespace',
            tags: ['customPrismaTag'],
          },
        });
      });
    });

    function givenAppAndBoundStubbedPrismaClient() {
      givenApp();
      prismaClientStub = sinon.stub(new PrismaClient());
      app
        .bind(PrismaBindings.PRISMA_CLIENT_INSTANCE)
        .to(prismaClientStub as unknown as PrismaClient)
        .inScope(BindingScope.SINGLETON);
    }

    function givenApp() {
      app = new Application();
    }
  });
});
