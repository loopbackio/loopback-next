// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {mergeSecuritySchemeToSpec} from '../..';
import {createEmptyApiSpec, SecuritySchemeObject} from '../../types';

describe('mergeSecuritySchemeToSpec', () => {
  it('adds security scheme to spec', () => {
    const spec = createEmptyApiSpec();
    const schemeName = 'basic';
    const schemeSpec: SecuritySchemeObject = {
      type: 'http',
      scheme: 'basic',
    };

    const newSpec = mergeSecuritySchemeToSpec(spec, schemeName, schemeSpec);
    expect(newSpec.components).to.deepEqual({
      securitySchemes: {
        basic: {
          type: 'http',
          scheme: 'basic',
        },
      },
    });
  });
});
