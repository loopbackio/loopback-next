// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {get, RestApplication, RestServerConfig} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {initTracer} from 'jaeger-client';
import {Span} from 'opentracing';
import {TracingComponent} from '../..';
import {TracingBindings} from '../../keys';
import {LOOPBACK_TRACE_ID} from '../../types';

describe('Tracing (acceptance)', () => {
  let app: RestApplication;
  let request: Client;

  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  context('with default config', () => {
    beforeEach(async () => {
      app = givenRestApplication();
      app.controller(MyController);
      app.service(GreetingService);
      app.component(TracingComponent);
      await app.start();
      request = createRestAppClient(app);
    });

    it('extracts existing traceId', async () => {
      const tracer = initTracer({serviceName: 'client'}, {
        contextKey: LOOPBACK_TRACE_ID,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const span = tracer.startSpan('ping');
      const spanStr = span.context().toString();
      await request
        .get('/ping')
        .set(LOOPBACK_TRACE_ID, spanStr)
        .expect(
          200,
          new RegExp(
            `\\[${getTraceId(span)}\\] ping - \\[[\\da-f]+\\] Hello, World\\.`,
          ),
        );
    });

    it('starts a new traceId', async () => {
      await request
        .get('/ping')
        .expect(200)
        .expect(200, /\[[\da-f]+\] ping - \[[\da-f]+\] Hello, World\./);
    });
  });

  function givenRestApplication(config?: RestServerConfig) {
    const rest = Object.assign({}, givenHttpServerConfig(), config);
    return new RestApplication({rest});
  }

  function getTraceId(span: Span) {
    return span
      .context()
      .toString()
      .split(':')[0];
  }

  class GreetingService {
    constructor(@inject(TracingBindings.SPAN) private span: Span) {}
    async greet(name: string) {
      const traceId = getTraceId(this.span);
      return `[${traceId}] Hello, ${name}.`;
    }
  }

  class MyController {
    @get('/ping')
    async ping(
      // Inject the service as a parameter so it can receive the span
      @inject('services.GreetingService', {asProxyWithInterceptors: true})
      greetingService: GreetingService,
      @inject(TracingBindings.SPAN) span: Span,
    ) {
      const traceId = getTraceId(span);
      const greeting = await greetingService.greet('World');
      return `[${traceId}] ping - ${greeting}`;
    }
  }
});
