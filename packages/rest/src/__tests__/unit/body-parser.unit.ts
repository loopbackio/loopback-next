// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {OperationObject, RequestBodyObject} from '@loopback/openapi-v3';
import {
  expect,
  ShotRequestOptions,
  stubExpressContext,
} from '@loopback/testlab';
import {
  JsonBodyParser,
  RawBodyParser,
  Request,
  RequestBody,
  RequestBodyParser,
  RequestBodyParserOptions,
  StreamBodyParser,
  TextBodyParser,
  UrlEncodedBodyParser,
} from '../..';
import {builtinParsers} from '../../body-parsers/body-parser.helpers';

describe('body parser', () => {
  const defaultSchema = {
    type: 'object',
  };
  let requestBodyParser: RequestBodyParser;
  before(givenRequestBodyParser);

  it('parses body parameter with multiple media types', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      payload: 'key=value',
    });

    const urlencodedSchema = {
      type: 'object',
      properties: {
        key: {type: 'string'},
      },
    };
    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'application/json': {schema: {type: 'object'}},
        'application/x-www-form-urlencoded': {
          schema: urlencodedSchema,
        },
      },
    });
    const requestBody = await requestBodyParser.loadRequestBodyIfNeeded(
      spec,
      req,
    );
    expect(requestBody).to.eql({
      value: {key: 'value'},
      coercionRequired: true,
      mediaType: 'application/x-www-form-urlencoded',
      schema: urlencodedSchema,
    });
  });

  it('allows application/json to be default', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: {key: 'value'},
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {},
    });
    const requestBody = await requestBodyParser.loadRequestBodyIfNeeded(
      spec,
      req,
    );
    expect(requestBody).to.eql({
      value: {key: 'value'},
      mediaType: 'application/json',
      schema: defaultSchema,
    });
  });

  it('allows text/json to be parsed', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'text/json',
      },
      payload: {key: 'value'},
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {'text/json': {schema: defaultSchema}},
    });
    const requestBody = await requestBodyParser.loadRequestBodyIfNeeded(
      spec,
      req,
    );
    expect(requestBody).to.eql({
      value: {key: 'value'},
      mediaType: 'text/json',
      schema: defaultSchema,
    });
  });

  it('allows */*.+json to be parsed', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'application/x-xyz+json',
      },
      payload: {key: 'value'},
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {'application/x-xyz+json': {schema: defaultSchema}},
    });
    const requestBody = await requestBodyParser.loadRequestBodyIfNeeded(
      spec,
      req,
    );
    expect(requestBody).to.eql({
      value: {key: 'value'},
      mediaType: 'application/x-xyz+json',
      schema: defaultSchema,
    });
  });

  it('parses body string as json', async () => {
    const req = givenRequest({
      url: '/',
      payload: '"value"',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {},
    });
    const requestBody = await requestBodyParser.loadRequestBodyIfNeeded(
      spec,
      req,
    );
    expect(requestBody).to.eql({
      value: 'value',
      mediaType: 'application/json',
      schema: defaultSchema,
    });
  });

  it('parses body number as json', async () => {
    const req = givenRequest({
      url: '/',
      payload: '123',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {},
    });
    const requestBody = await requestBodyParser.loadRequestBodyIfNeeded(
      spec,
      req,
    );
    expect(requestBody).to.eql({
      value: 123,
      mediaType: 'application/json',
      schema: defaultSchema,
    });
  });

  it('reports error for json payload with "__proto__" key', () => {
    const req = givenRequest({
      url: '/',
      payload: '{"x": 1, "__proto__": {"y": "2"}}',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {},
    });
    return expect(
      requestBodyParser.loadRequestBodyIfNeeded(spec, req),
    ).to.be.rejectedWith('JSON string cannot contain "__proto__" key.');
  });

  it('sorts body parsers', () => {
    const options: RequestBodyParserOptions = {};
    const bodyParser = new RequestBodyParser([
      new TextBodyParser(options),
      new StreamBodyParser(),
      new JsonBodyParser(options),
      new UrlEncodedBodyParser(options),
      new RawBodyParser(options),
      {
        name: 'xml',
        supports: mediaType => true,
        parse: async request => {
          return {value: 'xml'};
        },
      },
    ]);
    const names = bodyParser.parsers.map(p => p.name);
    expect(names).to.eql(['xml', ...builtinParsers.names]);
  });

  it('normalizes parsing errors', async () => {
    const bodyParser = new RequestBodyParser([
      {
        name: 'xml',
        supports: mediaType => true,
        parse: async request => {
          throw new Error('Not implemented');
        },
      },
    ]);
    const req = givenRequest({
      url: '/',
      payload: '<root>123</root>',
      headers: {
        'Content-Type': 'application/xml',
      },
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {'application/xml': {schema: defaultSchema}},
    });
    return expect(
      bodyParser.loadRequestBodyIfNeeded(spec, req),
    ).to.be.rejectedWith({statusCode: 400, message: 'Not implemented'});
  });

  describe('x-parser extension', () => {
    let spec: OperationObject;
    let req: Request;
    let requestBody: RequestBody;

    it('skips body parsing', async () => {
      await loadRequestBodyWithXStream('stream');
      expect(requestBody).to.eql({
        value: req,
        mediaType: 'application/json',
        schema: defaultSchema,
      });
    });

    it('allows custom parser by name', async () => {
      await loadRequestBodyWithXStream('json');
      expect(requestBody).to.eql({
        value: {key: 'value'},
        mediaType: 'application/json',
        schema: defaultSchema,
      });
    });

    it('allows raw parser', async () => {
      await loadRequestBodyWithXStream('raw');
      expect(requestBody).to.eql({
        value: Buffer.from(JSON.stringify({key: 'value'})),
        mediaType: 'application/json',
        schema: defaultSchema,
      });
    });

    it('allows custom parser by class', async () => {
      await loadRequestBodyWithXStream(JsonBodyParser);
      expect(requestBody).to.eql({
        value: {key: 'value'},
        mediaType: 'application/json',
        schema: defaultSchema,
      });
    });

    it('allows custom parser by function', async () => {
      function parseJson(request: Request) {
        return new JsonBodyParser().parse(request);
      }
      await loadRequestBodyWithXStream(parseJson);
      expect(requestBody).to.eql({
        value: {key: 'value'},
        mediaType: 'application/json',
        schema: defaultSchema,
      });
    });

    it('reports error if custom parser not found', async () => {
      return expect(loadRequestBodyWithXStream('xml'))
        .to.be.rejectedWith(/Custom parser not found\: xml/)
        .catch(e => {});
    });

    async function loadRequestBodyWithXStream(parser: string | Function) {
      spec = givenSpecWithXStream(parser);
      req = givenShowBodyRequest();
      requestBody = await requestBodyParser.loadRequestBodyIfNeeded(spec, req);
      return requestBody;
    }

    function givenShowBodyRequest() {
      return givenRequest({
        url: '/show-body',
        method: 'post',
        payload: {key: 'value'},
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    function givenSpecWithXStream(parser: string | Function) {
      return {
        'x-operation-name': 'showBody',
        requestBody: <RequestBodyObject>{
          required: true,
          content: {
            'application/json': {
              // Skip body parsing
              'x-parser': parser,
              schema: {type: 'object'},
            },
          },
        },
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
      };
    }
  });

  function givenRequestBodyParser() {
    const options: RequestBodyParserOptions = {};
    const parsers = [
      new JsonBodyParser(options),
      new UrlEncodedBodyParser(options),
      new TextBodyParser(options),
      new StreamBodyParser(),
      new RawBodyParser(options),
    ];
    requestBodyParser = new RequestBodyParser(parsers, new Context());
  }

  function givenOperationWithRequestBody(requestBody?: RequestBodyObject) {
    return <OperationObject>{
      'x-operation-name': 'testOp',
      requestBody: requestBody,
      responses: {},
    };
  }

  function givenRequest(options?: ShotRequestOptions): Request {
    return stubExpressContext(options).request;
  }
});
