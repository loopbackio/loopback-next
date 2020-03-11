// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect} from '@loopback/testlab';
import path from 'path';
import {FileUploadApplication} from '../..';
import {setupApplication} from './test-helper';

describe('file upload acceptance - multipart/form-data', () => {
  let client: Client;
  let app: FileUploadApplication;

  before(givenAClient);
  after(async () => {
    await app.stop();
  });

  it('supports file uploads', async () => {
    const FIXTURES = path.resolve(__dirname, '../../../fixtures');
    const res = await client
      .post('/file-upload')
      .field('user', 'john')
      .field('email', 'john@example.com')
      .attach('testFile1', path.resolve(FIXTURES, 'file-upload-test.txt'), {
        filename: 'file-upload-test.txt',
        contentType: 'multipart/form-data',
      })
      .attach('testFile2', path.resolve(FIXTURES, 'assets/index.html'), {
        filename: 'index.html',
        contentType: 'multipart/form-data',
      })
      .expect(200);
    expect(res.body.files[0]).containEql({
      fieldname: 'testFile1',
      originalname: 'file-upload-test.txt',
      mimetype: 'multipart/form-data',
    });
    expect(res.body.files[1]).containEql({
      fieldname: 'testFile2',
      originalname: 'index.html',
      mimetype: 'multipart/form-data',
    });
  });

  async function givenAClient() {
    ({app, client} = await setupApplication());
  }
});
