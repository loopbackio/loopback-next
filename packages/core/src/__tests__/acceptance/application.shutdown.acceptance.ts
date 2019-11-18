// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, skipIf} from '@loopback/testlab';
import {ChildProcess, fork} from 'child_process';

const app = require.resolve('./application-with-shutdown');
const isWindows = process.platform === 'win32';

describe('Application shutdown hooks', () => {
  skipIf(isWindows, it, 'traps registered signals - SIGTERM', () => {
    return testSignal('SIGTERM');
  });

  skipIf(
    isWindows,
    it,
    'traps registered signals with grace period - SIGTERM',
    () => {
      // No 'stopped` is recorded
      return testSignal('SIGTERM', 5, ['start\n', 'stop\n']);
    },
  );

  skipIf(isWindows, it, 'traps registered signals - SIGINT', () => {
    return testSignal('SIGINT');
  });

  skipIf(isWindows, it, 'does not trap unregistered signals - SIGHUP', () => {
    return testSignal('SIGHUP', undefined, ['start\n']);
  });

  function normalizeStdoutData(output: string[]) {
    // The received events can be `['start\n', 'stop\nstopped\n']` instead
    // of [ 'start\n', 'stop\n', 'stopped\n' ]
    return output.join('');
  }

  function createAppWithShutdown(
    expectedSignal: NodeJS.Signals,
    gracePeriod: number | undefined,
    expectedEvents: string[],
  ) {
    let args: string[] = [];
    if (typeof gracePeriod === 'number') {
      args = [gracePeriod.toString()];
    }
    const child = fork(app, args, {
      stdio: 'pipe',
    });
    const events: string[] = [];
    // Wait until the child process logs `start`
    const childStart = new Promise<ChildProcess>(resolve => {
      child.stdout!.on('data', (buf: Buffer) => {
        events.push(buf.toString('utf-8'));
        resolve(child);
      });
    });
    // Wait until the child process exits
    const childExit = new Promise((resolve, reject) => {
      child.on('exit', (code, sig) => {
        if (typeof sig === 'string') {
          // FIXME(rfeng): For some reason, the sig can be null
          expect(sig).to.eql(expectedSignal);
        }
        // The received events can be `['start\n', 'stop\nstopped\n']` instead
        // of [ 'start\n', 'stop\n', 'stopped\n' ]
        expect(normalizeStdoutData(events)).to.eql(
          normalizeStdoutData(expectedEvents),
        );
        resolve();
      });
      child.on('error', err => {
        reject(err);
      });
    });
    return {childStart, childExit};
  }

  async function testSignal(
    expectedSignal: NodeJS.Signals,
    gracePeriod: number | undefined = undefined,
    expectedEvents = ['start\n', 'stop\n', 'stopped\n'],
  ) {
    const {childStart, childExit} = createAppWithShutdown(
      expectedSignal,
      gracePeriod,
      expectedEvents,
    );
    const child = await childStart;
    // Send SIGTERM signal to the child process
    child.kill(expectedSignal);
    return childExit;
  }
});
