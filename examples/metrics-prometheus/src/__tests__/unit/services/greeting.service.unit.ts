// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-metrics-prometheus
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {GreetingService} from '../../../services';

describe('GreetingService (unit)', () => {
  let service: GreetingService;

  beforeEach(() => {
    service = new GreetingService();
  });

  describe('greet', () => {
    it('returns a greeting message', async () => {
      const result = await service.greet('World');

      expect(result).to.be.a.String();
      expect(result).to.match(/Hello, World/);
    });

    it('includes timestamp in greeting', async () => {
      const result = await service.greet('Alice');

      expect(result).to.match(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z: \d+\]/,
      );
    });

    it('includes delay information', async () => {
      const result = await service.greet('Bob');

      // Extract delay from message format: [timestamp: delay] Hello, name
      const delayMatch = result.match(/: (\d+)\]/);
      expect(delayMatch).to.not.be.null();

      const delay = parseInt(delayMatch![1], 10);
      expect(delay).to.be.greaterThanOrEqual(0);
      expect(delay).to.be.lessThan(100);
    });

    it('greets different names', async () => {
      const result1 = await service.greet('Alice');
      const result2 = await service.greet('Bob');
      const result3 = await service.greet('Charlie');

      expect(result1).to.match(/Hello, Alice/);
      expect(result2).to.match(/Hello, Bob/);
      expect(result3).to.match(/Hello, Charlie/);
    });

    it('handles empty name', async () => {
      const result = await service.greet('');

      expect(result).to.match(/Hello, $/);
    });

    it('handles special characters in name', async () => {
      const result = await service.greet('Alice & Bob');

      expect(result).to.match(/Hello, Alice & Bob/);
    });

    it('handles unicode characters in name', async () => {
      const result = await service.greet('世界');

      expect(result).to.match(/Hello, 世界/);
    });

    it('introduces random delay', async () => {
      const delays: number[] = [];

      // Call greet multiple times to collect delays
      for (let i = 0; i < 10; i++) {
        const result = await service.greet('Test');
        const delayMatch = result.match(/: (\d+)\]/);
        if (delayMatch) {
          delays.push(parseInt(delayMatch[1], 10));
        }
      }

      // Check that we got different delays (not all the same)
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).to.be.greaterThan(1);
    });

    it('completes within reasonable time', async () => {
      const startTime = Date.now();
      await service.greet('Performance Test');
      const endTime = Date.now();

      const duration = endTime - startTime;
      // Should complete within 150ms (max delay is 100ms + overhead)
      expect(duration).to.be.lessThan(150);
    });
  });

  describe('service injection', () => {
    it('is injectable', () => {
      expect(service).to.be.instanceOf(GreetingService);
    });

    it('has greet method', () => {
      expect(service.greet).to.be.a.Function();
    });
  });

  describe('concurrent greetings', () => {
    it('handles multiple concurrent greetings', async () => {
      const promises = [
        service.greet('User1'),
        service.greet('User2'),
        service.greet('User3'),
      ];

      const results = await Promise.all(promises);

      expect(results).to.have.length(3);
      expect(results[0]).to.match(/Hello, User1/);
      expect(results[1]).to.match(/Hello, User2/);
      expect(results[2]).to.match(/Hello, User3/);
    });
  });
});

// Made with Bob
