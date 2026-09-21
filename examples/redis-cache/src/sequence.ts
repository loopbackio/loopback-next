import {inject} from '@loopback/core';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {CacheBindings, CacheCheckFn, CacheSetFn} from 'loopback-api-cache';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(CacheBindings.CACHE_CHECK_ACTION)
    protected checkCache: CacheCheckFn,
    @inject(CacheBindings.CACHE_SET_ACTION) protected setCache: CacheSetFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);

      // Important part added to check for cache and respond with that if found
      const cache = await this.checkCache(request);
      if (cache) {
        this.send(response, cache.data);
        return;
      }

      const result = await this.invoke(route, args);
      this.send(response, result);

      // Important part added to set cache with the result
      await this.setCache(request, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
