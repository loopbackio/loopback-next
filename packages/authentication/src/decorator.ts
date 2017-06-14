// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authenticate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Reflector} from '@loopback/context';

/* interface to define authentication metadata structure expected in
 * json objects
 */
export interface IMetadata {
  // name of the passport strategy to use for authentication
  strategy: string;
  // options to configure the passport strategy
  options: Object;
}

/* class to hold authentication metadata
 */
export class AuthenticationMetadata {
  strategyName: string;
  options: Object;

  constructor(private strategy: string, private optionValues?: Object) {
    this.strategyName = strategy;
    this.options = optionValues || {};
  }
  getMetadata(): IMetadata {
    return {strategy: this.strategyName, options: this.options};
  }
}

/**
 * decorator to add authentication metadata to controller methods
 * @param strategyName
 * @param options
 */
export function authenticate(strategyName: string, options?: Object) {
  return function(controllerClass: Object, methodName: string) {
    const metadataObj: AuthenticationMetadata = new AuthenticationMetadata(
      strategyName,
      options || {},
    );
    Reflector.defineMetadata(
      'loopback:authenticate',
      metadataObj,
      controllerClass,
      methodName,
    );
  };
}

/**
 * function to get stored authentication metadata in a controller method
 * @param controllerObj
 * @param methodName
 */
export function getAuthenticateMetadata(
  controllerObj: Object,
  methodName: string,
): IMetadata {
  const metadataObj: AuthenticationMetadata = Reflector.getMetadata(
    'loopback:authenticate',
    controllerObj,
    methodName,
  );
  return metadataObj.getMetadata();
}
