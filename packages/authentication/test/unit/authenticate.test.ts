// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {authenticate, getAuthenticateMetadata, AuthenticationMetadata} from '../../src/decorator';

describe('Authentication', () => {
  describe('Class AuthenticationMetadata type', () => {
    it('can create authentication descriptor for a strategy', () => {
      const metadataObj: AuthenticationMetadata = new AuthenticationMetadata('my-strategy', {option: 'my-options'});
      const metaData = metadataObj.getMetadata();
      const expectedMetaDataObject = {strategy: 'my-strategy', options: {option: 'my-options'}};
      expect(metaData).to.deepEqual(expectedMetaDataObject);
    });

    it('can create authentication descriptor with strategy and options', () => {
      const metadataObj: AuthenticationMetadata = new AuthenticationMetadata('my-strategy', {option: 'my-options'});
      const metaData = metadataObj.getMetadata();
      const expectedMetaDataObject = {strategy: 'my-strategy', options: {option: 'my-options'}};
      expect(metaData).to.deepEqual(expectedMetaDataObject);
    });
  });

  describe('@authenticate decorator', () => {
    it('can add authenticate metadata to target method', () => {
      class TestClass {
        @authenticate('my-strategy', {option1: 'value1', option2: 'value2'})
        async whoAmI() {}
      }

      const test: TestClass = new TestClass();

      const metaData = getAuthenticateMetadata(test, 'whoAmI');
      const expectedMetaDataObject = {strategy: 'my-strategy', options: {option1: 'value1', option2: 'value2'}};
      expect(metaData).to.deepEqual(expectedMetaDataObject);
    });

    it('can add authenticate metadata to target method without options', () => {
      class TestClass {
        @authenticate('my-strategy')
        async whoAmI() {}
      }

      const test: TestClass = new TestClass();

      const metaData = getAuthenticateMetadata(test, 'whoAmI');
      const expectedMetaDataObject = {strategy: 'my-strategy', options: {}};
      expect(metaData).to.deepEqual(expectedMetaDataObject);
    });
  });
});
