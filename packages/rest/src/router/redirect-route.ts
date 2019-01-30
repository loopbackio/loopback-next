import {RouteEntry, ResolvedRoute} from '.';
import {RequestContext} from '../request-context';
import {OperationObject, SchemasObject} from '@loopback/openapi-v3-types';
import {OperationArgs, OperationRetval, PathParameterValues} from '../types';

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
    public readonly sourcePath: string,
    public targetPath: string,
    public statusCode: number = 303,
  ) {
    this.sourcePath = sourcePath;
  }

  async invokeHandler(
    {response}: RequestContext,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    response.redirect(this.statusCode, this.targetPath);
  }

  updateBindings(requestContext: RequestContext) {
    // no-op
  }

  describe(): string {
    return `RedirectRoute from "${this.sourcePath}" to "${this.targetPath}"`;
  }
}
