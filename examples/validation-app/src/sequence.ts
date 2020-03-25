// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {
  FindRoute,
  HttpErrors,
  InvokeMethod,
  LogError,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {ErrorWriterOptions} from 'strong-error-handler';

const SequenceActions = RestBindings.SequenceActions;

/**
 * A few things to note on top of the generated sequence
 * 1. inject RestBindings.SequenceActions.LOG_ERROR for logging error
 * 2. customize error for particular endpoints
 * 3. create a new error with customized properties
 * 4. log the error using RestBindings.SequenceActions.LOG_ERROR
 */
export class MySequence implements SequenceHandler {
  // 1. inject RestBindings.SequenceActions.LOG_ERROR for logging error
  // and RestBindings.ERROR_WRITER_OPTIONS for options
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(RestBindings.SequenceActions.LOG_ERROR)
    protected logError: LogError,
    @inject(RestBindings.ERROR_WRITER_OPTIONS, {optional: true})
    protected errorWriterOptions?: ErrorWriterOptions,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.handleError(context, <HttpErrors.HttpError>err);
    }
  }

  /**
   * Handle errors
   * If the request url is `/coffee-shops`, customize the error message.
   * @param context
   * @param err
   */
  handleError(context: RequestContext, err: HttpErrors.HttpError) {
    // 2. customize error for particular endpoint
    if (context.request.url === '/coffee-shops') {
      // if this is a validation error
      if (err.statusCode === 422) {
        const customizedMessage = 'My customized validation error message';

        let customizedProps = {};
        if (this.errorWriterOptions?.debug) {
          customizedProps = {stack: err.stack};
        }

        // 3. Create a new error with customized properties
        // you can change the status code here too
        const errorData = {
          statusCode: 422,
          message: customizedMessage,
          resolution: 'Contact your admin for troubleshooting.',
          code: 'VALIDATION_FAILED',
          ...customizedProps,
        };

        context.response.status(422).send(errorData);

        // 4. log the error using RestBindings.SequenceActions.LOG_ERROR
        this.logError(err, err.statusCode, context.request);

        // The error was handled
        return;
      }
    }

    // Otherwise fall back to the default error handler
    this.reject(context, err);
  }
}
