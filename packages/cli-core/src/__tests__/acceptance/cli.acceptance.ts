// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, createBindingFromClass} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {format} from 'util';
import {Cli, CLI_KEY} from '../../';
import {registerGenerator} from '../../types';
import HelloGenerator from '../fixtures/generators/hello';

describe('Cli', () => {
  let app: Application;

  beforeEach(givenApp);

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
    const cli = await app.get(CLI_KEY);
    const env = await cli.setupGenerators();
    let msg = '';
    env.adapter.log = (formatter: string, ...args: unknown[]) => {
      msg = format(formatter, ...args);
    };
    await cli.runCommand({_: ['hello', 'John']});
    expect(msg).to.eql('Hello, John.');
  }

  function givenApp() {
    app = new Application();
    app.add(createBindingFromClass(Cli));
  }
});
