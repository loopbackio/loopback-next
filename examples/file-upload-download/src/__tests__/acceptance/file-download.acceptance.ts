// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-file-upload-download
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, TestSandbox} from '@loopback/testlab';
import {FileUploadApplication} from '../..';
import {getSandbox, setupApplication} from './test-helper';

describe('file download acceptance', () => {
  let sandbox: TestSandbox;
  let client: Client;
  let app: FileUploadApplication;

  before(givenAClient);

  beforeEach(resetSandbox);

  after(async () => {
    await app.stop();
  });

  after(resetSandbox);

  it('list files', async () => {
    await client.get('/file-download').expect(200, []);
    await sandbox.writeJsonFile('test.json', {test: 'XYZ'});
    await client.get('/file-download').expect(200, ['test.json']);
  });

  it('reports 404 if file does not exist', async () => {
    await client.get('/file-download/does-not-exst.txt').expect(404);
  });

  it('download a file', async () => {
    await sandbox.writeJsonFile('test.json', {test: 'JSON'});
    await client.get('/file-download/test.json').expect(200, {test: 'JSON'});
  });

  async function givenAClient() {
    ({app, client} = await setupApplication());
  }

  async function resetSandbox() {
    sandbox = getSandbox();
    await sandbox.reset();
  }
});
