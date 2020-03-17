---
lang: en
title: 'Upload and download files'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/File-upload-download.html
---

## File upload and download

It's a common requirement for API applications to support file upload and
download. This page describes how to expose REST APIs for uploading and
downloading files using LoopBack 4. It also illustrates how to build a simple
Web UI to interact with such APIs.

A fully-functional example is available at
[@loopback/example-file-transfer](https://github.com/strongloop/loopback-next/tree/master/examples/file-transfer).
We use code snippets from the example to walk through the key artifacts.

### File upload

A few steps are involved to create an endpoint for file upload.

1. Create a controller class such as
   [`FileUploadController`](https://github.com/strongloop/loopback-next/blob/master/examples/file-transfer/src/controllers/file-upload.controller.ts)

```ts
import {inject} from '@loopback/context';
import {
  post,
  Request,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler} from '../types';
/**
 * A controller to handle file uploads using multipart/form-data media type
 */
export class FileUploadController {
  /**
   * Constructor
   * @param handler - Inject an express request handler to deal with the request
   */
  constructor(
    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
  ) {}
}
```

In the example, we inject an instance of `FileUploadService` backed by
[multer](https://github.com/expressjs/multer) to process the incoming http
request. The
[`FileUploadService`](https://github.com/strongloop/loopback-next/blob/master/examples/file-transfer/src/services/file-upload.service.ts)
is configurable to support various storage engines.

2. Add a method for file upload

```ts
/**
 * A controller to handle file uploads using multipart/form-data media type
 */
export class FileUploadController {
  @post('/files', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async fileUpload(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      this.handler(request, response, err => {
        if (err) reject(err);
        else {
          resolve(FileUploadController.getFilesAndFields(request));
        }
      });
    });
  }
}
```

The `@post` decoration exposes the method over `POST /files` endpoint to accept
file upload. We also apply `@requestBody.file()` to mark the request body to be
files being uploaded using `multipart/form-data` content type. The injected
`request` and `response` objects are passed into the `multer` handler to process
the stream, saving to `.sandbox` directory in our example.

See more details about `@requestBody.file` in
[OpenAPI decorators](decorators/Decorators_openapi.md#requestbodyfile).

### File download

To download files from the backend, please follow the following steps.

1. Create a controller class such as
   [`FileDownloadController`](https://github.com/strongloop/loopback-next/blob/master/examples/file-transfer/src/controllers/file-download.controller.ts)

```ts
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
export class FileDownloadController {}
```

2. (optional) Add a method to list available files

```ts
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
```

The `@get` decorator exposes `GET /files` to list available file. Our example
implementation simply returns an array of file names under the `.sandbox`
directory.

3. Add a method to download a file by name

```ts
export class FileDownloadController {
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
```

The `@get` decorator exposes `GET /files/{filename}` for file download. We use
`response.download` from `Express` to send the file.

The decoration of `@oas.response.file()` sets the OpenAPI response object for
file download. See more details about `@oas.response.file` in
[OpenAPI decorators](decorators/Decorators_openapi.md#using-oasresponsefile).

{% include note.html content="
The `downloadFile` returns `response` as-is to instruct LoopBack to skip the
response serialization step as `response.download` manipulates the `response`
stream directly.
" %}

{% include warning.html content="
The `fileName` argument is from user input. We have to validate the value to
prevent the request to access files outside the `.sandbox` directory. The
`validateFileName` method resolves the file by name and rejects the request if
the file is outside the sandbox.
" %}

### Build a simple UI

The example application comes with a
[simple HTML page](https://github.com/strongloop/loopback-next/blob/master/examples/file-transfer/public/index.html).

The page contains the following JavaScript functions:

```js
/**
 * Submit the upload form
 */
function setupUploadForm() {
  const formElem = document.getElementById('uploadForm');
  formElem.onsubmit = async e => {
    e.preventDefault();
    const res = await fetch('/files', {
      method: 'POST',
      body: new FormData(formElem),
    });
    const body = await res.json();
    console.log('Response from upload', body);
    await fetchFiles();
  };
}
/**
 * List uploaded files
 */
async function fetchFiles() {
  const res = await fetch('/files');
  const files = await res.json();
  console.log('Response from list', files);
  const list = files.map(f => `<li><a href="/files/${f}">${f}</a></li>\n`);
  document.getElementById('fileList').innerHTML = list.join('');
}
async function init() {
  setupUploadForm();
  await fetchFiles();
}
```

The page has two key divisions:

- A form for file selection and upload
- A list of files with URL links to be downloaded

```html
<body onload="init();">
  <div class="info">
    <h1>File upload and download</h1>

    <div id="upload">
      <h3>Upload files</h3>
      <form id="uploadForm">
        <label for="files">Select files:</label>
        <input type="file" id="files" name="files" multiple /><br /><br />
        <label for="note">Note:</label>
        <input
          type="text"
          name="note"
          id="note"
          placeholder="Note about the files"
        />
        <br /><br />
        <input type="submit" />
      </form>
    </div>

    <div id="download">
      <h3>Download files</h3>
      <ul id="fileList"></ul>
      <button onclick="fetchFiles()">Refresh</button>
    </div>

    <h3>OpenAPI spec: <a href="/openapi.json">/openapi.json</a></h3>
    <h3>API Explorer: <a href="/explorer">/explorer</a></h3>
  </div>

  <footer class="power">
    <a href="https://loopback.io" target="_blank">
      <img
        src="https://loopback.io/images/branding/powered-by-loopback/blue/powered-by-loopback-sm.png"
      />
    </a>
  </footer>
</body>
```
