// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-webpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {assertGreetings, generateBundle} from './test-helper';

describe('bundle-node.js', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bundle: any;

  before('generate bundle-node.js', async function (this: Mocha.Context) {
    // It may take some time to generate the bundle using webpack
    this.timeout(30000);
    await generateBundle('node');
    bundle = require('../../bundle-node');
  });

  it('invokes main function', async () => {
    const greetings: string[] = await bundle.main();
    assertGreetings(greetings);
  });

  it('has access to Context', async () => {
    const ctx = new bundle.Context('my-ctx');
    expect(ctx.name).to.eql('my-ctx');
  });
});
