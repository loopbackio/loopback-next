// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OperationObject} from '@loopback/openapi-v3-types';
import {safeDump} from 'js-yaml';
import {RouteEntry} from '.';
import {RequestContext} from '../request-context';
import {OpenApiSpecForm, RestServer} from '../rest.server';
import {OperationArgs, OperationRetval} from '../types';

export class ServeApiSpecRoute implements RouteEntry {
  readonly verb: string = 'get';
  readonly spec: OperationObject = {
    description: 'LoopBack route serving OpenAPI spec',
    'x-visibility': 'undocumented',
    responses: {},
  };

  constructor(
    public readonly path: string,
    private readonly server: RestServer,
    private readonly specForm: OpenApiSpecForm = {
      version: '3.0.0',
      format: 'json',
    },
  ) {}

  async invokeHandler(
    requestContext: RequestContext,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    const {response, requestedBaseUrl, basePath} = requestContext;
    console.log('requested url %s basePath %s', requestedBaseUrl, basePath);
    let specObj = this.server.getApiSpec();
    if (requestContext.serverConfig.openApiSpec.setServersFromRequest) {
      specObj = Object.assign({}, specObj);
      specObj.servers = [{url: requestedBaseUrl}];
    }

    if (specObj.servers && basePath) {
      for (const s of specObj.servers) {
        // Update the default server url to honor `basePath`
        if (s.url === '/') {
          s.url = basePath;
        }
      }
    }

    if (this.specForm.format === 'json') {
      const spec = JSON.stringify(specObj, null, 2);
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.end(spec, 'utf-8');
    } else {
      const yaml = safeDump(specObj, {});
      response.setHeader('content-type', 'text/yaml; charset=utf-8');
      response.end(yaml, 'utf-8');
    }
  }

  updateBindings(requestContext: RequestContext) {
    // no-op
  }

  describe(): string {
    return `${this.spec.description} at ${this.path}`;
  }
}
