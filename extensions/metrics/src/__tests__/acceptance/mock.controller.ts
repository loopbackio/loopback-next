// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {
  del,
  get,
  HttpErrors,
  patch,
  post,
  put,
  Response,
  RestBindings,
} from '@loopback/rest';

/**
 * A mockup controller to collect different method invocation metrics
 */
export class MockController {
  constructor() {}

  @get('/success')
  success() {}

  @post('/success')
  postSuccess() {}

  @put('/success')
  putSuccess() {}

  @patch('/success')
  patchSuccess() {}

  @del('/success')
  deleteSuccess() {}

  @get('/success-with-data')
  successWithData() {
    return {key: 'value'};
  }

  @get('/redirect')
  redirect(
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    return response.redirect('/some-path');
  }

  @get('/bad-request')
  badRequest() {
    throw new HttpErrors.BadRequest();
  }

  @get('/entity-not-found')
  entityNotFound() {
    throw Object.assign(new Error(), {code: 'ENTITY_NOT_FOUND'});
  }

  @get('/server-error')
  serverError() {
    throw new Error();
  }
}
