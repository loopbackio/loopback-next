// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {RestServer, RestComponent, HttpErrors, RestBindings} from '../../..';
import {writeFileSync} from 'fs';
import {StaticServer} from '../../../src/static.server';
import {HttpError} from 'http-errors';
import * as path from 'path';

describe.only('static server', () => {
  let app: Application;
  it('allows directory to be specified', async () => {
    const server = new StaticServer(app, {dir: path.parse('foo/bar')});
    const dir = await server.get(RestBindings.DIR);
    expect(dir).to.deepEqual(path.parse('foo/bar'));
  });
  it('allows multiple calls', async () => {});

  // it('defaults to /src/public', async () => {
  //   let res = await staticFileServer();
  // });

  // it('returns a 404 if no files are found', async () => {
  //   let res: HttpError = await staticFileServer('/path/without/any/files');
  //   expect(res).to.equal(HttpErrors.NotFound);
  // });

  async function givenStaticFiles() {
    let myFileContent = 'Hello World!';
    let myFilePath = 'greeting.txt';
    try {
      writeFileSync(myFilePath, myFileContent);
    } catch (err) {
      if (err) throw err;
    }
  }

  async function givenApplication() {
    app = new Application({
      components: [RestComponent],
    });
  }
});
