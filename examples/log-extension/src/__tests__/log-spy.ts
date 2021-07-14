// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {sinon} from '@loopback/testlab';
import {InMemoryLog} from './in-memory-logger';

export type AddSpy = sinon.SinonSpy<[(string | undefined)?], void>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogStub = sinon.SinonStub<[any?, ...any[]], void>;

export function createLogSpy() {
  return sinon.spy(InMemoryLog.prototype, 'add');
}

export function restoreLogSpy(spy: AddSpy | LogStub) {
  spy.restore();
}

export function createConsoleStub(): LogStub {
  return sinon.stub(console, 'log');
}
