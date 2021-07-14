// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  AuthenticationMetadata,
  getAuthenticationMetadataForStrategy,
} from '../../../types';
import {
  mockAuthenticationMetadata,
  mockAuthenticationMetadata2,
} from '../fixtures/mock-metadata';

describe('getAuthenticationMetadataForStrategy', () => {
  let metadata: AuthenticationMetadata[];

  beforeEach(givenAuthenticationMetadata);

  it('should return the authentication metadata for the specified strategy', () => {
    const {strategy, options} = mockAuthenticationMetadata;
    const strategyMetadata = getAuthenticationMetadataForStrategy(
      metadata,
      strategy,
    );

    expect(strategyMetadata).to.not.be.undefined();
    expect(strategyMetadata!.strategy).to.equal(strategy);
    expect(strategyMetadata!.options).to.equal(options);
  });

  it('should return undefined if no metadata exists for the specified strategy', () => {
    const strategyMetadata = getAuthenticationMetadataForStrategy(
      metadata,
      'doesnotexist',
    );

    expect(strategyMetadata).to.be.undefined();
  });

  function givenAuthenticationMetadata() {
    metadata = [mockAuthenticationMetadata, mockAuthenticationMetadata2];
  }
});
