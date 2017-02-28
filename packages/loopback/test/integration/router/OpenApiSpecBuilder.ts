// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OpenApiSpec, OperationObject} from './../../../lib/router/OpenApiSpec';

export default class OpenApiSpecBuilder {
  private _spec: OpenApiSpec;

  constructor(basePath: string = '/') {
    this._spec = {
      basePath,
      paths: {},
    };
  }

  withOperation(verb: string, path: string, spec: OperationObject): this {
    if (!this._spec.paths[path])
      this._spec.paths[path] = {};
    this._spec.paths[path][verb] = spec;
    return this;
  }

  withOperationReturningString(verb: string, path: string, operationName: string): this {
    return this.withOperation(verb, path, {
      'x-operation-name': operationName,
      responses: {
        '200': { type: 'string' },
      },
    });
  }

  build(): OpenApiSpec {
    // TODO(bajtos): deep-clone
    return this._spec;
  }
}
