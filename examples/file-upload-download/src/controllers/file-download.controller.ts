// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-file-upload-download
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {
  get,
  HttpErrors,
  oas,
  param,
  Response,
  RestBindings,
} from '@loopback/rest';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

const readdir = promisify(fs.readdir);

const SANDBOX = path.resolve(__dirname, '../../.sandbox');

/**
 * A controller to handle file downloads using multipart/form-data media type
 */
export class FileDownloadController {
  @get('/files', {
    responses: {
      200: {
        content: {
          // string[]
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
  async listFiles() {
    const files = await readdir(SANDBOX);
    return files;
  }

  @get('/files/{filename}')
  @oas.response.file()
  downloadFile(
    @param.path.string('filename') fileName: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const file = validateFileName(fileName);
    response.download(file, fileName);
    return response;
  }
}

/**
 * Validate file names to prevent them goes beyond the designated directory
 * @param fileName - File name
 */
function validateFileName(fileName: string) {
  const resolved = path.resolve(SANDBOX, fileName);
  if (resolved.startsWith(SANDBOX)) return resolved;
  // The resolved file is outside sandbox
  throw new HttpErrors.BadRequest(`Invalid file name: ${fileName}`);
}
