// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {OptionsUrlencoded} from 'body-parser';
import crypto from 'crypto';
import qs from 'qs';
import {
  getParserOptions,
  JsonBodyParser,
  post,
  RawBodyParser,
  Request,
  requestBody,
  RequestBodyParserOptions,
  RestApplication,
  RestBindings,
} from '../../..';

describe('request parsing', () => {
  let client: Client;
  let app: RestApplication;
  let parsedRequestBodyValue: unknown;

  beforeEach(givenAClient);
  afterEach(async () => {
    await app.stop();
  });

  it('supports x-parser extension', async () => {
    await postRequest('/show-body-json');
  });

  it('allows built-in body parsers to be overridden', async () => {
    class MyJsonBodyParser extends JsonBodyParser {
      supports(mediaType: string) {
        return false;
      }
    }
    app.bodyParser(MyJsonBodyParser, RestBindings.REQUEST_BODY_PARSER_JSON);
    await postRequest('/show-body', 415);
    await postRequest('/show-body-json');
  });

  it('invokes custom body parsers before built-in ones', async () => {
    let invoked = false;
    class MyJsonBodyParser extends JsonBodyParser {
      name = Symbol('my-json');
      async parse(request: Request) {
        const body = await super.parse(request);
        invoked = true;
        return body;
      }
    }
    app.bodyParser(MyJsonBodyParser);
    await client
      .post('/show-body')
      .set('Content-Type', 'application/json')
      .send({key: 'value'})
      .expect(200, {key: 'new-value'});
    expect(invoked).to.be.true();
  });

  it('invokes custom body parsers to calculate hash', async () => {
    let invoked = false;
    class UrlEncodedBodyParserForHash extends RawBodyParser {
      private urlEncodedOptions: OptionsUrlencoded;
      constructor(
        @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
        private options: RequestBodyParserOptions = {},
      ) {
        super(options);
        this.urlEncodedOptions = getParserOptions('urlencoded', this.options);
      }

      async parse(request: Request) {
        const body = await super.parse(request);
        const buffer = body.value;
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');
        // We cannot use UrlEncodedParser as `request.body` is set by `RawBodyParser`
        const value = qs.parse(
          buffer.toString('utf-8'),
          this.urlEncodedOptions,
        );
        value.hash = hash;
        invoked = true;
        body.value = value;
        return body;
      }
    }

    app.controller(
      givenBodyParamController(
        '/show-body-encoded',
        UrlEncodedBodyParserForHash,
      ),
      'Controller3',
    );
    await client
      .post('/show-body-encoded')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({key: 'value'})
      .expect(200, {
        key: 'new-value',
        parser: 'UrlEncodedBodyParserForHash',
      });
    expect(invoked).to.be.true();
  });

  it('allows built-in body parsers to be removed', async () => {
    app.unbind(RestBindings.REQUEST_BODY_PARSER_JSON);
    await postRequest('/show-body', 415);
  });

  async function givenAClient() {
    parsedRequestBodyValue = undefined;
    app = new RestApplication({rest: givenHttpServerConfig()});
    app.controller(
      givenBodyParamController('/show-body-json', 'json'),
      'Controller1',
    );
    app.controller(givenBodyParamController('/show-body'), 'Controller2');
    await app.start();
    client = createRestAppClient(app);
  }

  async function postRequest(url = '/show-body', expectedStatusCode = 200) {
    const res = await client
      .post(url)
      .set('Content-Type', 'application/json')
      .send({key: 'value'})
      .expect(expectedStatusCode);
    if (expectedStatusCode === 200) {
      expect(parsedRequestBodyValue).to.eql({key: 'value'});
    }
    return res;
  }

  function givenBodyParamController(url: string, parser?: string | Function) {
    class RouteParamController {
      @post(url, {
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
            description: '',
          },
        },
      })
      async showBody(
        @requestBody({
          required: true,
          content: {
            'application/json': {
              // Customize body parsing
              'x-parser': parser,
              schema: {type: 'object'},
            },
            'application/x-www-form-urlencoded': {
              // Customize body parsing
              'x-parser': parser,
              schema: {type: 'object'},
            },
          },
        })
        request: // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
      ): Promise<object> {
        parsedRequestBodyValue = request;
        if (parser === 'stream') {
          parsedRequestBodyValue = request.body;
        }
        const parserName = typeof parser === 'string' ? parser : parser?.name;
        return {key: 'new-value', parser: parserName};
      }
    }
    return RouteParamController;
  }
});
