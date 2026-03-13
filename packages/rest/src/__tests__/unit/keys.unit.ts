// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {RestBindings, RestTags} from '../../keys';

describe('RestBindings', () => {
  describe('binding keys', () => {
    it('has HOST binding key', () => {
      expect(RestBindings.HOST.key).to.equal('rest.host');
    });

    it('has PORT binding key', () => {
      expect(RestBindings.PORT.key).to.equal('rest.port');
    });

    it('has PATH binding key', () => {
      expect(RestBindings.PATH.key).to.equal('rest.path');
    });

    it('has URL binding key', () => {
      expect(RestBindings.URL.key).to.equal('rest.url');
    });

    it('has PROTOCOL binding key', () => {
      expect(RestBindings.PROTOCOL.key).to.equal('rest.protocol');
    });

    it('has HTTPS_OPTIONS binding key', () => {
      expect(RestBindings.HTTPS_OPTIONS.key).to.equal('rest.httpsOptions');
    });

    it('has SERVER binding key', () => {
      expect(RestBindings.SERVER.key).to.equal('servers.RestServer');
    });

    it('has BASE_PATH binding key', () => {
      expect(RestBindings.BASE_PATH.key).to.equal('rest.basePath');
    });

    it('has HANDLER binding key', () => {
      expect(RestBindings.HANDLER.key).to.equal('rest.handler');
    });

    it('has ROUTER binding key', () => {
      expect(RestBindings.ROUTER.key).to.equal('rest.router');
    });

    it('has ROUTER_OPTIONS binding key', () => {
      expect(RestBindings.ROUTER_OPTIONS.key).to.equal('rest.router.options');
    });

    it('has ERROR_WRITER_OPTIONS binding key', () => {
      expect(RestBindings.ERROR_WRITER_OPTIONS.key).to.equal(
        'rest.errorWriterOptions',
      );
    });

    it('has REQUEST_BODY_PARSER_OPTIONS binding key', () => {
      expect(RestBindings.REQUEST_BODY_PARSER_OPTIONS.key).to.equal(
        'rest.requestBodyParserOptions',
      );
    });

    it('has REQUEST_BODY_PARSER binding key', () => {
      expect(RestBindings.REQUEST_BODY_PARSER.key).to.equal(
        'rest.requestBodyParser',
      );
    });

    it('has REQUEST_BODY_PARSER_JSON binding key', () => {
      expect(RestBindings.REQUEST_BODY_PARSER_JSON.key).to.equal(
        'rest.requestBodyParser.JsonBodyParser',
      );
    });

    it('has REQUEST_BODY_PARSER_URLENCODED binding key', () => {
      expect(RestBindings.REQUEST_BODY_PARSER_URLENCODED.key).to.equal(
        'rest.requestBodyParser.UrlEncodedBodyParser',
      );
    });

    it('has REQUEST_BODY_PARSER_TEXT binding key', () => {
      expect(RestBindings.REQUEST_BODY_PARSER_TEXT.key).to.equal(
        'rest.requestBodyParser.TextBodyParser',
      );
    });

    it('has REQUEST_BODY_PARSER_RAW binding key', () => {
      expect(RestBindings.REQUEST_BODY_PARSER_RAW.key).to.equal(
        'rest.requestBodyParser.RawBodyParser',
      );
    });

    it('has REQUEST_BODY_PARSER_STREAM binding key', () => {
      expect(RestBindings.REQUEST_BODY_PARSER_STREAM.key).to.equal(
        'rest.requestBodyParser.StreamBodyParser',
      );
    });

    it('has AJV_FACTORY binding key', () => {
      expect(RestBindings.AJV_FACTORY.key).to.equal(
        'rest.requestBodyParser.rest.ajvFactory',
      );
    });

    it('has API_SPEC binding key', () => {
      expect(RestBindings.API_SPEC.key).to.equal('rest.apiSpec');
    });

    it('has OPERATION_SPEC_CURRENT binding key', () => {
      expect(RestBindings.OPERATION_SPEC_CURRENT.key).to.equal(
        'rest.operationSpec.current',
      );
    });

    it('has SEQUENCE binding key', () => {
      expect(RestBindings.SEQUENCE.key).to.equal('rest.sequence');
    });

    it('has INVOKE_MIDDLEWARE_SERVICE binding key', () => {
      expect(RestBindings.INVOKE_MIDDLEWARE_SERVICE.key).to.equal(
        'rest.invokeMiddleware',
      );
    });
  });

  describe('SequenceActions binding keys', () => {
    it('has INVOKE_MIDDLEWARE binding key', () => {
      expect(RestBindings.SequenceActions.INVOKE_MIDDLEWARE.key).to.equal(
        'rest.sequence.actions.invokeMiddleware',
      );
    });

    it('has FIND_ROUTE binding key', () => {
      expect(RestBindings.SequenceActions.FIND_ROUTE.key).to.equal(
        'rest.sequence.actions.findRoute',
      );
    });

    it('has PARSE_PARAMS binding key', () => {
      expect(RestBindings.SequenceActions.PARSE_PARAMS.key).to.equal(
        'rest.sequence.actions.parseParams',
      );
    });

    it('has INVOKE_METHOD binding key', () => {
      expect(RestBindings.SequenceActions.INVOKE_METHOD.key).to.equal(
        'rest.sequence.actions.invokeMethod',
      );
    });

    it('has LOG_ERROR binding key', () => {
      expect(RestBindings.SequenceActions.LOG_ERROR.key).to.equal(
        'rest.sequence.actions.logError',
      );
    });

    it('has SEND binding key', () => {
      expect(RestBindings.SequenceActions.SEND.key).to.equal(
        'rest.sequence.actions.send',
      );
    });

    it('has REJECT binding key', () => {
      expect(RestBindings.SequenceActions.REJECT.key).to.equal(
        'rest.sequence.actions.reject',
      );
    });
  });

  describe('Operation binding keys', () => {
    it('has ROUTE binding key', () => {
      expect(RestBindings.Operation.ROUTE.key).to.equal('rest.operation.route');
    });

    it('has PARAMS binding key', () => {
      expect(RestBindings.Operation.PARAMS.key).to.equal(
        'rest.operation.params',
      );
    });

    it('has RETURN_VALUE binding key', () => {
      expect(RestBindings.Operation.RETURN_VALUE.key).to.equal(
        'rest.operation.returnValue',
      );
    });
  });

  describe('Http binding keys', () => {
    it('has REQUEST binding key', () => {
      expect(RestBindings.Http.REQUEST.key).to.equal('rest.http.request');
    });

    it('has RESPONSE binding key', () => {
      expect(RestBindings.Http.RESPONSE.key).to.equal('rest.http.response');
    });

    it('has CONTEXT binding key', () => {
      expect(RestBindings.Http.CONTEXT.key).to.equal(
        'rest.http.request.context',
      );
    });
  });

  describe('ROUTES namespace', () => {
    it('has correct value', () => {
      expect(RestBindings.ROUTES).to.equal('routes');
    });
  });
});

describe('RestTags', () => {
  it('has REST_ROUTE tag', () => {
    expect(RestTags.REST_ROUTE).to.equal('restRoute');
  });

  it('has ROUTE_VERB tag', () => {
    expect(RestTags.ROUTE_VERB).to.equal('restRouteVerb');
  });

  it('has ROUTE_PATH tag', () => {
    expect(RestTags.ROUTE_PATH).to.equal('restRoutePath');
  });

  it('has CONTROLLER_ROUTE tag', () => {
    expect(RestTags.CONTROLLER_ROUTE).to.equal('controllerRoute');
  });

  it('has CONTROLLER_BINDING tag', () => {
    expect(RestTags.CONTROLLER_BINDING).to.equal('controllerBinding');
  });

  it('has AJV_KEYWORD tag', () => {
    expect(RestTags.AJV_KEYWORD).to.equal('ajvKeyword');
  });

  it('has AJV_FORMAT tag', () => {
    expect(RestTags.AJV_FORMAT).to.equal('ajvFormat');
  });

  it('has REST_MIDDLEWARE_CHAIN tag', () => {
    expect(RestTags.REST_MIDDLEWARE_CHAIN).to.equal('middlewareChain.default');
  });

  it('has ACTION_MIDDLEWARE_CHAIN tag', () => {
    expect(RestTags.ACTION_MIDDLEWARE_CHAIN).to.equal(
      'middlewareChain.rest.actions',
    );
  });
});

// Made with Bob
