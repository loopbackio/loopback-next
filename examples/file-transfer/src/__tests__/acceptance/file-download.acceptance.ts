// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, TestSandbox} from '@loopback/testlab';
import {FileUploadApplication} from '../..';
import {getSandbox, setupApplication} from './test-helper';

describe('file download acceptance', () => {
  let sandbox: TestSandbox;
  let client: Client;
  let app: FileUploadApplication;

  before(givenSandbox);
  before(givenAClient);

  beforeEach(resetSandbox);

  after(async () => {
    await app.stop();
  });

  after(resetSandbox);

  it('list files', async () => {
    await client.get('/files').expect(200, []);
    await sandbox.writeJsonFile('test.json', {test: 'XYZ'});
    await client.get('/files').expect(200, ['test.json']);
  });

  it('reports 404 if file does not exist', async () => {
    await client.get('/files/does-not-exist.txt').expect(404);
  });

  it('reports 400 if file name is resolved outside the sandbox', async () => {
    const badFileName = '%2Fbad-file.txt'; // `/bad-file.txt`
    await client.get(`/files/${badFileName}`).expect(400, {
      error: {
        statusCode: 400,
        name: 'BadRequestError',
        message: 'Invalid file name: /bad-file.txt',
      },
    });
  });

  it('reports 400 if file name is resolved outside the sandbox with ..', async () => {
    const badFileName = '%2E%2E%2Fbad-file.txt'; // `../bad-file.txt`
    await client.get(`/files/${badFileName}`).expect(400, {
      error: {
        statusCode: 400,
        name: 'BadRequestError',
        message: 'Invalid file name: ../bad-file.txt',
      },
    });
  });

  it('download a file', async () => {
    await sandbox.writeJsonFile('test.json', {test: 'JSON'});
    await client.get('/files/test.json').expect(200, {test: 'JSON'});
  });

  function givenSandbox() {
    sandbox = getSandbox();
  }

  async function givenAClient() {
    ({app, client} = await setupApplication(sandbox.path));
  }

  async function resetSandbox() {
    await sandbox.reset();
  }
});
