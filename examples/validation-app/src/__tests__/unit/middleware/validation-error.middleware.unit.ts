// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {HttpErrors, Request, RestBindings} from '@loopback/rest';
import {expect, sinon} from '@loopback/testlab';
import {ValidationErrorMiddlewareProvider} from '../../../middleware/validation-error.middleware';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('ValidationErrorMiddleware (unit)', () => {
  let provider: ValidationErrorMiddlewareProvider;
  let logErrorStub: sinon.SinonStub;
  let middlewareContext: any;
  let response: any;

  beforeEach(() => {
    logErrorStub = sinon.stub();
    provider = new ValidationErrorMiddlewareProvider(logErrorStub);
    response = givenResponse();
    middlewareContext = givenMiddlewareContext();
  });

  describe('value()', () => {
    it('returns a middleware function', async () => {
      const middleware = await provider.value();
      expect(middleware).to.be.a.Function();
    });
  });

  describe('middleware execution', () => {
    it('passes through when no error occurs', async () => {
      const middleware = await provider.value();
      const next = sinon.stub().resolves('success');

      const result = await middleware(middlewareContext, next);

      expect(result).to.equal('success');
      expect(next.calledOnce).to.be.true();
    });
  });

  describe('handleError() for /coffee-shops endpoint', () => {
    beforeEach(() => {
      middlewareContext.request.url = '/coffee-shops';
    });

    it('customizes 422 validation error for PATCH method', async () => {
      const middleware = await provider.value();
      const error = new HttpErrors.UnprocessableEntity('Validation failed');
      error.statusCode = 422;
      const next = sinon.stub().rejects(error);

      middlewareContext.request.method = 'PATCH';

      await middleware(middlewareContext, next);

      sinon.assert.calledWith(response.status, 422);
      sinon.assert.calledOnce(response.send);

      const sentData = response.send.getCall(0).args[0];
      expect(sentData).to.containEql({
        statusCode: 422,
        message: 'My customized validation error message',
        resolution: 'Contact your admin for troubleshooting.',
        code: 'VALIDATION_FAILED',
      });
      expect(logErrorStub.calledOnce).to.be.true();
    });

    it('includes stack trace when debug mode is enabled', async () => {
      provider = new ValidationErrorMiddlewareProvider(logErrorStub, {
        debug: true,
      });
      const middleware = await provider.value();
      const error = new HttpErrors.UnprocessableEntity('Validation failed');
      error.statusCode = 422;
      const next = sinon.stub().rejects(error);

      middlewareContext.request.method = 'PATCH';

      await middleware(middlewareContext, next);

      const sentData = response.send.getCall(0).args[0];
      expect(sentData).to.have.property('stack');
    });

    it('does not customize 422 error for non-PATCH methods', async () => {
      const middleware = await provider.value();
      const error = new HttpErrors.UnprocessableEntity('Validation failed');
      error.statusCode = 422;
      const next = sinon.stub().rejects(error);

      middlewareContext.request.method = 'POST';

      try {
        await middleware(middlewareContext, next);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });

    it('does not customize non-422 errors for PATCH method', async () => {
      const middleware = await provider.value();
      const error = new HttpErrors.BadRequest('Bad request');
      const next = sinon.stub().rejects(error);

      middlewareContext.request.method = 'PATCH';

      try {
        await middleware(middlewareContext, next);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });

    it('logs the error with correct parameters', async () => {
      const middleware = await provider.value();
      const error = new HttpErrors.UnprocessableEntity('Validation failed');
      error.statusCode = 422;
      const next = sinon.stub().rejects(error);

      middlewareContext.request.method = 'PATCH';

      await middleware(middlewareContext, next);

      expect(logErrorStub.calledOnce).to.be.true();
      expect(logErrorStub.firstCall.args[0]).to.equal(error);
      expect(logErrorStub.firstCall.args[1]).to.equal(422);
      expect(logErrorStub.firstCall.args[2]).to.equal(
        middlewareContext.request,
      );
    });

    it('returns the response after handling error', async () => {
      const middleware = await provider.value();
      const error = new HttpErrors.UnprocessableEntity('Validation failed');
      error.statusCode = 422;
      const next = sinon.stub().rejects(error);

      middlewareContext.request.method = 'PATCH';

      const result = await middleware(middlewareContext, next);

      expect(result).to.equal(response);
    });
  });

  describe('handleError() for /pets endpoint', () => {
    beforeEach(() => {
      middlewareContext.request.url = '/pets';
    });

    it('customizes 422 validation error for PATCH method', async () => {
      const middleware = await provider.value();
      const error = new HttpErrors.UnprocessableEntity('Validation failed');
      error.statusCode = 422;
      const next = sinon.stub().rejects(error);

      middlewareContext.request.method = 'PATCH';

      await middleware(middlewareContext, next);

      sinon.assert.calledWith(response.status, 422);
      sinon.assert.calledOnce(response.send);

      const sentData = response.send.getCall(0).args[0];
      expect(sentData).to.containEql({
        statusCode: 422,
        message: 'My customized validation error message',
        resolution: 'Contact your admin for troubleshooting.',
        code: 'VALIDATION_FAILED',
      });
    });

    it('does not customize for non-PATCH methods', async () => {
      const middleware = await provider.value();
      const error = new HttpErrors.UnprocessableEntity('Validation failed');
      error.statusCode = 422;
      const next = sinon.stub().rejects(error);

      middlewareContext.request.method = 'GET';

      try {
        await middleware(middlewareContext, next);
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });

  describe('error writer options', () => {
    it('works without error writer options', async () => {
      provider = new ValidationErrorMiddlewareProvider(logErrorStub);
      const middleware = await provider.value();
      const error = new HttpErrors.UnprocessableEntity('Validation failed');
      error.statusCode = 422;
      const next = sinon.stub().rejects(error);

      middlewareContext.request.url = '/coffee-shops';
      middlewareContext.request.method = 'PATCH';

      await middleware(middlewareContext, next);

      const sentData = response.send.getCall(0).args[0];
      expect(sentData).to.not.have.property('stack');
    });

    it('includes stack when debug is true', async () => {
      provider = new ValidationErrorMiddlewareProvider(logErrorStub, {
        debug: true,
      });
      const middleware = await provider.value();
      const error = new HttpErrors.UnprocessableEntity('Validation failed');
      error.statusCode = 422;
      const next = sinon.stub().rejects(error);

      middlewareContext.request.url = '/coffee-shops';
      middlewareContext.request.method = 'PATCH';

      await middleware(middlewareContext, next);

      const sentData = response.send.getCall(0).args[0];
      expect(sentData).to.have.property('stack');
    });
  });

  function givenResponse() {
    return {
      status: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  }

  function givenMiddlewareContext() {
    const context = new Context();
    const request = {
      url: '/coffee-shops',
      method: 'POST',
    } as Request;

    context.bind(RestBindings.Http.REQUEST).to(request);
    context.bind(RestBindings.Http.RESPONSE).to(response);

    return {
      request,
      response,
      getBinding: context.getBinding.bind(context),
      getConfigAsValueOrPromise:
        context.getConfigAsValueOrPromise.bind(context),
      getValueOrPromise: context.getValueOrPromise.bind(context),
      get: context.get.bind(context),
      getSync: context.getSync.bind(context),
    };
  }
});
