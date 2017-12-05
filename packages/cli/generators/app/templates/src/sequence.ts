import {Context} from '@loopback/context';
import {
  DefaultSequence,
  FindRoute,
  InvokeMethod,
  ParsedRequest,
  ParseParams,
  Reject,
  Send,
} from '@loopback/rest';
import {ServerResponse} from 'http';

export class MySequence extends DefaultSequence {
  constructor(
    public ctx: Context,
    protected findRoute: FindRoute,
    protected parseParams: ParseParams,
    protected invoke: InvokeMethod,
    public send: Send,
    public reject: Reject
  ) {
    super(ctx, findRoute, parseParams, invoke, send, reject);
  }

  // Handle your request routing here:
  async handle(req: ParsedRequest, res: ServerResponse) {
    // findRoute() produces an element
    const route = this.findRoute(req);
    // parseParams() uses the route element and produces the params element
    const params = await this.parseParams(req, route);
    // invoke() uses both the route and params elements to produce the result (OperationRetVal) element
    const result = await this.invoke(route, params);
    // send() uses the result element
    await this.send(res, result);
  }
}
