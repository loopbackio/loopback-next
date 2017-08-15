import {
  FindRoute,
  inject,
  InvokeMethod,
  parseOperationArgs,
  ParsedRequest,
  Reject,
  Send,
  ServerResponse,
  SequenceHandler,
} from '@loopback/core';

import {
  AuthenticateFn,
} from '@loopback/authentication';

export class MySequence implements SequenceHandler {
  constructor(
    @inject('sequence.actions.findRoute') protected findRoute: FindRoute,
    @inject('sequence.actions.invokeMethod') protected invoke: InvokeMethod,
    @inject('sequence.actions.send') protected send: Send,
    @inject('sequence.actions.reject') protected reject: Reject,
    @inject('authentication.actions.authenticate')
    protected authenticateRequest: AuthenticateFn,
  ) {}

  async handle(req: ParsedRequest, res: ServerResponse) {
    try {
      const route = this.findRoute(req);

      fakeAuthenticate(req);

      const user = await this.authenticateRequest(req);

      const args = await parseOperationArgs(req, route);
      const result = await this.invoke(route, args);
      this.send(res, result);
    } catch (err) {
      this.reject(res, req, err);
    }
  }
}

function fakeAuthenticate(req: ParsedRequest) {
  var parts = [
    // schema
    'Basic',
    // credentials: a:a
    'YTph',
  ];
  req.headers['authorization'] = parts.join(' ');
}
