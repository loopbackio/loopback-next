// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {createEmptyApiSpec} from '../../types';

describe('createEmptyApiSpec', () => {
  it('sets version 3', () => {
    expect(createEmptyApiSpec().openapi).to.equal('3.0.0');
  });

  it('sets the spec info object', () => {
    expect(createEmptyApiSpec().info).to.deepEqual({
      title: 'LoopBack Application',
      version: '1.0.0',
    });
  });

  it('creates an empty paths object', () => {
    expect(createEmptyApiSpec().paths).to.deepEqual({});
  });

  it('creates a default servers array', () => {
    expect(createEmptyApiSpec().servers).to.deepEqual([{url: '/'}]);
  });
});
