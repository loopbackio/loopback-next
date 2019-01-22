// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {OperationArgs, Request, Response, RestBindings} from '@loopback/rest';
import * as debugFactory from 'debug';
import {SharedMethod} from './shared-method';

const debug = debugFactory('loopback:v3compat:rest-adapter');

export class Lb3ModelController {
  @inject(RestBindings.Http.REQUEST)
  protected request: Request;

  @inject(RestBindings.Http.RESPONSE)
  protected response: Response;

  // TODO: a property for strong-remoting's HttpContext

  [key: string]: Function | Request | Response;

  protected buildMethodArguments(
    sharedMethod: SharedMethod,
    inputArgs: OperationArgs,
  ) {
    const finalArgs: OperationArgs = [];
    for (const argSpec of sharedMethod.accepts) {
      const source = argSpec.http && argSpec.http.source;
      switch (source) {
        case 'req':
          finalArgs.push(this.request);
          break;
        case 'res':
          finalArgs.push(this.response);
          break;
        default:
          finalArgs.push(inputArgs.shift());
      }
    }
    return finalArgs;
  }

  protected invokeStaticMethod(
    sharedMethod: SharedMethod,
    argsFromSpec: OperationArgs,
  ) {
    debug('%s initial args %j', sharedMethod.stringName, argsFromSpec);
    const args = this.buildMethodArguments(sharedMethod, argsFromSpec);
    debug('resolved args %j', args);

    // TODO: beforeRemote, afterRemote, afterRemoteError hooks

    const cb = createPromiseCallback();
    args.push(cb);

    const handler = sharedMethod.getFunction();
    return handler.apply(sharedMethod.ctor, args) || cb.promise;
  }
}

function createPromiseCallback() {
  let cb: Function = OOPS;
  // tslint:disable-next-line:no-any
  const promise = new Promise<any>(function(resolve, reject) {
    // tslint:disable-next-line:no-any
    cb = function(err: any, result: any) {
      if (err) return reject(err);
      return resolve(result);
    };
  });
  return Object.assign(cb, {promise});
}

// Dummy function to get rid of TS compiler warning
function OOPS() {
  throw new Error('NEVER GET HERE');
}
