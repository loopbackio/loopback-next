// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {format} from 'util';
import {CliApplication} from '../../cli';
import {registerGenerator} from '../../types';
import HelloGenerator from '../fixtures/generators/hello';

describe('Cli', () => {
  let app: CliApplication;

  beforeEach(givenApp);
  afterEach(() => app.stop());

  it('registers generators by constructor', async () => {
    registerGenerator(app, HelloGenerator);
    await testCliCommand();
  });

  it('registers generators by metadata', async () => {
    registerGenerator(app, {
      path: require.resolve('../fixtures/generators/hello'),
      name: 'hello',
    });
    await testCliCommand();
  });

  async function testCliCommand() {
    await app.start();
    let msg = '';
    app.env.adapter.log = (formatter: string, ...args: unknown[]) => {
      msg = format(formatter, ...args);
    };
    await app.run({_: ['hello', 'John']});
    expect(msg).to.eql('Hello, John.');
  }

  function givenApp() {
    app = new CliApplication();
  }
});
