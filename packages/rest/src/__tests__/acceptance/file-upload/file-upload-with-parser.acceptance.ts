// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import * as multer from 'multer';
import * as path from 'path';
import {
  BodyParser,
  post,
  Request,
  requestBody,
  RequestBody,
  RestApplication,
} from '../../..';

const FORM_DATA = 'multipart/form-data';

describe('multipart/form-data parser', () => {
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
        contentType: FORM_DATA,
      })
      .expect(200);
    expect(res.body.files[0]).containEql({
      fieldname: 'testFile',
      originalname: 'file-upload-test.txt',
      mimetype: FORM_DATA,
    });
    expect(res.body.fields.user).to.equal('john');
    expect(res.body.fields.email).to.equal('john@example.com');
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
          [FORM_DATA]: {
            schema: {type: 'object'},
          },
        },
      })
      body: unknown,
    ) {
      return body;
    }
  }

  async function givenAClient() {
    app = new RestApplication({rest: givenHttpServerConfig()});
    app.bodyParser(MultipartFormDataBodyParser);
    app.controller(FileUploadController);
    await app.start();
    client = createRestAppClient(app);
  }
});

class MultipartFormDataBodyParser implements BodyParser {
  name = FORM_DATA;

  supports(mediaType: string) {
    // The mediaType can be
    // `multipart/form-data; boundary=--------------------------979177593423179356726653`
    return mediaType.startsWith(FORM_DATA);
  }

  async parse(request: Request): Promise<RequestBody> {
    const storage = multer.memoryStorage();
    const upload = multer({storage});
    return new Promise<RequestBody>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      upload.any()(request, {} as any, err => {
        if (err) reject(err);
        else {
          resolve({
            value: {
              files: request.files,
              fields: request.body,
            },
          });
        }
      });
    });
  }
}
