// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {sinon} from '@loopback/testlab';
import {InMemoryLog} from './in-memory-logger';

export function createLogSpy() {
  return sinon.spy(InMemoryLog.prototype, 'add');
}

export function restoreLogSpy(spy: sinon.SinonSpy) {
  spy.restore();
}

export function createConsoleStub() {
  return sinon.stub(console, 'log');
}
