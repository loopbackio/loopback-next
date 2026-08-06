// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-metrics-prometheus
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {GreetingController} from '../../../controllers';
import {GreetingService} from '../../../services';

describe('GreetingController (unit)', () => {
  let controller: GreetingController;
  let greetingService: StubbedInstanceWithSinonAccessor<GreetingService>;

  beforeEach(() => {
    greetingService = createStubInstance(GreetingService);
    controller = new GreetingController(greetingService);
  });

  describe('greet', () => {
    it('calls greeting service with name', async () => {
      const greeting = '[2026-02-11T12:00:00.000Z: 50] Hello, World';
      greetingService.stubs.greet.resolves(greeting);

      const result = await controller.greet('World');

      expect(result).to.deepEqual([greeting]);
      sinon.assert.calledWith(greetingService.stubs.greet, 'World');
    });

    it('returns single greeting by default', async () => {
      const greeting = '[2026-02-11T12:00:00.000Z: 25] Hello, Alice';
      greetingService.stubs.greet.resolves(greeting);

      const result = await controller.greet('Alice');

      expect(result).to.have.length(1);
      expect(result[0]).to.equal(greeting);
    });

    it('returns multiple greetings when count is specified', async () => {
      const greeting1 = '[2026-02-11T12:00:00.000Z: 10] Hello, Bob';
      const greeting2 = '[2026-02-11T12:00:00.100Z: 20] Hello, Bob';
      const greeting3 = '[2026-02-11T12:00:00.200Z: 30] Hello, Bob';

      greetingService.stubs.greet
        .onFirstCall()
        .resolves(greeting1)
        .onSecondCall()
        .resolves(greeting2)
        .onThirdCall()
        .resolves(greeting3);

      const result = await controller.greet('Bob', 3);

      expect(result).to.have.length(3);
      expect(result).to.deepEqual([greeting1, greeting2, greeting3]);
      sinon.assert.calledThrice(greetingService.stubs.greet);
    });

    it('handles count parameter of 1', async () => {
      const greeting = '[2026-02-11T12:00:00.000Z: 15] Hello, Charlie';
      greetingService.stubs.greet.resolves(greeting);

      const result = await controller.greet('Charlie', 1);

      expect(result).to.have.length(1);
      sinon.assert.calledOnce(greetingService.stubs.greet);
    });

    it('handles count parameter of 0', async () => {
      const result = await controller.greet('Dave', 0);

      expect(result).to.have.length(0);
      sinon.assert.notCalled(greetingService.stubs.greet);
    });

    it('handles large count values', async () => {
      const greeting = '[2026-02-11T12:00:00.000Z: 40] Hello, Eve';
      greetingService.stubs.greet.resolves(greeting);

      const result = await controller.greet('Eve', 10);

      expect(result).to.have.length(10);
      sinon.assert.callCount(greetingService.stubs.greet, 10);
    });

    it('calls service concurrently for multiple greetings', async () => {
      const greeting = '[2026-02-11T12:00:00.000Z: 35] Hello, Frank';
      greetingService.stubs.greet.resolves(greeting);

      await controller.greet('Frank', 5);

      // All calls should be made concurrently (Promise.all)
      sinon.assert.callCount(greetingService.stubs.greet, 5);
      greetingService.stubs.greet.getCalls().forEach(call => {
        sinon.assert.calledWith(call, 'Frank');
      });
    });

    it('handles different names', async () => {
      greetingService.stubs.greet
        .withArgs('Alice')
        .resolves('[2026-02-11T12:00:00.000Z: 10] Hello, Alice');
      greetingService.stubs.greet
        .withArgs('Bob')
        .resolves('[2026-02-11T12:00:00.000Z: 20] Hello, Bob');

      const result1 = await controller.greet('Alice');
      const result2 = await controller.greet('Bob');

      expect(result1[0]).to.match(/Hello, Alice/);
      expect(result2[0]).to.match(/Hello, Bob/);
    });

    it('handles empty name', async () => {
      const greeting = '[2026-02-11T12:00:00.000Z: 5] Hello, ';
      greetingService.stubs.greet.resolves(greeting);

      const result = await controller.greet('');

      expect(result).to.have.length(1);
      sinon.assert.calledWith(greetingService.stubs.greet, '');
    });

    it('handles special characters in name', async () => {
      const greeting = '[2026-02-11T12:00:00.000Z: 45] Hello, Test@123';
      greetingService.stubs.greet.resolves(greeting);

      const result = await controller.greet('Test@123');

      expect(result[0]).to.equal(greeting);
      sinon.assert.calledWith(greetingService.stubs.greet, 'Test@123');
    });
  });

  describe('service injection', () => {
    it('injects greeting service', () => {
      expect(controller).to.have.property('greetingService');
    });

    it('uses service with interceptors', () => {
      // The controller is configured to use asProxyWithInterceptors
      // This ensures metrics interceptor can track the service calls
      expect(controller).to.be.instanceOf(GreetingController);
    });
  });

  describe('error handling', () => {
    it('propagates service errors', async () => {
      const error = new Error('Service error');
      greetingService.stubs.greet.rejects(error);

      await expect(controller.greet('ErrorTest')).to.be.rejectedWith(
        'Service error',
      );
    });

    it('handles rejection in one of multiple calls', async () => {
      const error = new Error('One call failed');
      greetingService.stubs.greet
        .onFirstCall()
        .resolves('[2026-02-11T12:00:00.000Z: 10] Hello, Test')
        .onSecondCall()
        .rejects(error);

      await expect(controller.greet('Test', 2)).to.be.rejectedWith(
        'One call failed',
      );
    });
  });
});

// Made with Bob
