import {RouteEntry, ResolvedRoute} from '.';
import {RequestContext} from '../request-context';
import {OperationObject, SchemasObject} from '@loopback/openapi-v3-types';
import {OperationArgs, OperationRetval, PathParameterValues} from '../types';
import {Request} from "express";
export class RedirectRoute implements RouteEntry, ResolvedRoute {
  // ResolvedRoute API
  readonly pathParams: PathParameterValues = [];
  readonly schemas: SchemasObject = {};

  // RouteEntry implementation
  readonly verb: string = 'get';
  readonly path: string = this.sourcePath;
  readonly spec: OperationObject = {
    description: 'LoopBack Redirect route',
    'x-visibility': 'undocumented',
    responses: {},
  };

  constructor(
    private readonly sourcePath: string,
    private readonly targetLocation: string | Function,
    private readonly statusCode: number = 303,
  ) {}

  async invokeHandler(
    {response,request}: RequestContext,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    let basePath = this._getBasePath(request) || '';
    let targetLocation :string = typeof this.targetLocation === 'function'
        ? this.targetLocation(
          this._getProtocolForRequest(request),
          this._getHost(request),
          basePath
      ) : basePath + this.targetLocation;
    response.redirect(this.statusCode,targetLocation);
  }

  updateBindings(requestContext: RequestContext) {
    // no-op
  }

  describe(): string {
    return `RedirectRoute from "${this.sourcePath}" to "${
      this.targetLocation
    }"`;
  }

  private _getHost(request: Request) {
      return request.get('x-forwarded-host') || request.headers.host;
  }

  private _getProtocolForRequest(request: Request) {
      return (
          (request.get('x-forwarded-proto') || '').split(',')[0] ||
          request.protocol ||
          'http'
      );
  }

   private _getBasePath(request: Request) {
        let basePath = '';
        if (request.baseUrl && request.baseUrl !== '/') {
            basePath = request.baseUrl + basePath;
        }
        return basePath;
    }
}
