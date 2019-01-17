// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {Request, Response, RestBindings, OperationArgs} from '@loopback/rest';
import {SharedMethod} from './shared-method';

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
}
