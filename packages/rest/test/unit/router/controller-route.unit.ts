// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ControllerRoute} from '../../..';
import {expect} from '@loopback/testlab';
import {anOperationSpec} from '@loopback/openapi-spec-builder';

describe('ControllerRoute', () => {
  it('rejects routes with no methodName', () => {
    class MyController {}
    const spec = anOperationSpec().build();

    expect(
      () => new ControllerRoute('get', '/greet', spec, MyController),
    ).to.throw(/methodName must be provided.*"get \/greet".*MyController/);
  });
});
