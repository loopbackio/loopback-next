// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, Sequence} from '../../../src';

describe('Bootstrapping - Application', () => {
  context('with user-defined configurations', () => {
    let app: Application;
    before(givenAppWithConfigs);

    it('registers the given components', () => {
      expect(app.find('component.*'))
        .to.be.instanceOf(Array)
        .with.lengthOf(4);
    });

    it('registers the given sequence', () => {
      expect(app.find('sequence.*'))
        .to.be.instanceOf(Array)
        .with.lengthOf(1);
    });

    function givenAppWithConfigs() {
      class Todo { }
      class Authentication { }
      class Authorization { }
      class Rejection { }
      class TodoSequence extends Sequence { }
      app = new Application({
        components: [Todo, Authentication, Authorization, Rejection],
        sequences: [TodoSequence],
      });
    }
  });
});
