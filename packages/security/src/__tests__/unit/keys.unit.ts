// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/security
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {SecurityBindings} from '../../keys';

describe('SecurityBindings', () => {
  describe('binding keys', () => {
    it('has SUBJECT binding key', () => {
      expect(SecurityBindings.SUBJECT.key).to.equal('security.subject');
    });

    it('has USER binding key', () => {
      expect(SecurityBindings.USER.key).to.equal('security.user');
    });

    it('SUBJECT and USER keys are different', () => {
      expect(SecurityBindings.SUBJECT.key).to.not.equal(
        SecurityBindings.USER.key,
      );
    });

    it('binding keys are immutable', () => {
      const subjectKey = SecurityBindings.SUBJECT.key;
      const userKey = SecurityBindings.USER.key;
      expect(SecurityBindings.SUBJECT.key).to.equal(subjectKey);
      expect(SecurityBindings.USER.key).to.equal(userKey);
    });
  });
});

// Made with Bob
