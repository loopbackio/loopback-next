// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, Sequence} from '../../..';

describe('Bootstrapping the application', () => {
  let app: Application;

  context('with a user-defined sequence', () => {
    before(givenAppWithUserDefinedSequence);

    it('binds the `sequence` key to the user-defined sequence', async () => {
      const binding = await app.get('sequence');
      expect(binding.constructor.name).to.equal('UserDefinedSequence');
    });

    function givenAppWithUserDefinedSequence() {
      class UserDefinedSequence extends Sequence { }
      app = new Application({
        sequence: UserDefinedSequence,
      });
    }
  });

  context('with user-defined components', () => {
    before(givenAppWithUserDefinedComponents);

    it('binds all user-defined components to the application context', () => {
      expect(app.find('component.*'))
        .to.be.instanceOf(Array)
        .with.lengthOf(4);
    });

    function givenAppWithUserDefinedComponents() {
      class Todo {}
      class Authentication {}
      class Authorization {}
      class Rejection {}
      app = new Application({
        components: [Todo, Authentication, Authorization, Rejection],
      });
    }
  });
});
