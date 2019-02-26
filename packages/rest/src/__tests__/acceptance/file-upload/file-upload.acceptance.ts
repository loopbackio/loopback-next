// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import * as multer from 'multer';
import * as path from 'path';
import {
  post,
  Request,
  requestBody,
  Response,
  RestApplication,
  RestBindings,
} from '../../..';

describe('multipart/form-data', () => {
  let client: Client;
  let app: RestApplication;
  before(givenAClient);
  after(async () => {
    await app.stop();
  });

  it('supports file uploads', async () => {
    const FIXTURES = path.resolve(__dirname, '../../../../fixtures');
    const res = await client
      .post('/show-body')
      .field('user', 'john')
      .field('email', 'john@example.com')
      .attach('testFile', path.resolve(FIXTURES, 'file-upload-test.txt'), {
        filename: 'file-upload-test.txt',
        contentType: 'multipart/form-data',
      })
      .expect(200);
    expect(res.body.files[0]).containEql({
      fieldname: 'testFile',
      originalname: 'file-upload-test.txt',
      mimetype: 'multipart/form-data',
    });
  });

  class FileUploadController {
    @post('/show-body', {
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
              },
            },
          },
          description: '',
        },
      },
    })
    async showBody(
      @requestBody({
        description: 'multipart/form-data value.',
        required: true,
        content: {
          'multipart/form-data': {
            // Skip body parsing
            'x-parser': 'stream',
            schema: {type: 'object'},
          },
        },
      })
      request: Request,
      @inject(RestBindings.Http.RESPONSE) response: Response,
    ): Promise<object> {
      const storage = multer.memoryStorage();
      const upload = multer({storage});
      return new Promise<object>((resolve, reject) => {
        upload.any()(request, response, err => {
          if (err) reject(err);
          else {
            resolve({
              files: request.files,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fields: (request as any).fields,
            });
          }
        });
      });
    }
  }

  async function givenAClient() {
    app = new RestApplication({rest: givenHttpServerConfig()});
    app.controller(FileUploadController);
    await app.start();
    client = createRestAppClient(app);
  }
});
