// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {GreetController} from '../../../controllers';

describe('greet.controller', () => {
  const controller = new GreetController();
  describe('basicHello', () => {
    it('returns greetings for the world without valid input', () => {
      expect(controller.basicHello({})).to.equal('Hello, World!');
    });

    it('returns greetings for a name', () => {
      const input = {
        name: 'Aaron',
      };
      const expected = `Hello, ${input.name}!`;
      expect(controller.basicHello(input)).to.equal(expected);
    });
  });
  describe('hobbyHello', () => {
    it('returns greetings for a name', () => {
      const input = {
        name: 'Aaron',
      };
      expect(controller.hobbyHello(input)).to.match(
        /Hello, Aaron!(.*)underwater basket weaving/,
      );
    });

    it('returns greetings for a name and hobby', () => {
      const input = {
        name: 'Aaron',
        hobby: 'sportsball',
      };
      expect(controller.hobbyHello(input)).to.match(
        /Hello, Aaron!(.*)sportsball/,
      );
    });
  });
});
