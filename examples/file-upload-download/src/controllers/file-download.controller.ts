// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-file-upload-download
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {get, param, Response, RestBindings} from '@loopback/rest';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

const readdir = promisify(fs.readdir);

/**
 * A controller to handle file downloads using multipart/form-data media type
 */
export class FileDownloadController {
  @get('/file-download', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        description: 'A list of files',
      },
    },
  })
  async listFiles(@inject(RestBindings.Http.RESPONSE) response: Response) {
    const sandbox = path.join(__dirname, '../../.sandbox');
    const files = await readdir(sandbox);
    return files;
  }

  @get('/file-download/{filename}')
  async downloadFile(
    @param.path.string('filename') fileName: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const file = path.join(__dirname, '../../.sandbox', fileName);
    response.download(file, fileName);
    return response;
  }
}
