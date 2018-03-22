import {Context, inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParsedRequest,
  ParseParams,
  Reject,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {ServerResponse} from 'http';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(RestBindings.Http.CONTEXT) public ctx: Context,
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) {}

  async handle(req: ParsedRequest, res: ServerResponse) {
    try {
      const route = this.findRoute(req);
      const args = await this.parseParams(req, route);
      const result = await this.invoke(route, args);
      this.send(res, result);
    } catch (err) {
      this.reject(res, req, err);
    }
  }
}
