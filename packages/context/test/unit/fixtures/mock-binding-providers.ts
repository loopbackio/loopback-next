// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ValueProvider, FunctionProvider, ConstructorProvider, Constructor, inject} from '../../../src';

export class MockValueProvider extends ValueProvider {
  constructor(@inject('msg') private _msg: string) {
    super();
  }

  source(): string {
    return this._msg + ' world';
  }
}

export class MockFunctionProvider extends FunctionProvider {
  constructor(@inject('now') private now: Date, @inject('prefix') private prefix: string) {
    super();
  }

  source(): () => string {
    return () => {
      return this.prefix + ' ' + this.now;
    };
  }
}

export class MockLoopbackController {
  constructor(@inject('param') private param: string) {}
  action(): string {
    return this.param;
  }
}

export class MockConstructorProvider extends ConstructorProvider<MockLoopbackController> {
  constructor(@inject('arg1') private arg1: string) {
    super();
  }

  source(): Constructor<MockLoopbackController> {
    return MockLoopbackController;
  }
}
