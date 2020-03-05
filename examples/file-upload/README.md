# @loopback/example-file-upload

An example application to demonstrate file uploads for LoopBack 4

## Summary

This application comes with a controller that exposes `/file-upload` endpoint
that accepts `multipart/form-data` based file uploads.

## Key artifacts

- [FileUploadController](src/controllers/file-upload.controller.ts)

  - Expose `/file-upload` endpoint to allow file uploads

- [FileUploadService - an Express middleware from multer](src/services/file-upload.service.ts)

  - A service provider that returns a configured `multer` request handler

The file upload is configured with `multer` options in
[src/application.ts](src/application.ts) as follows:

```ts
// Configure file upload with multer options
const multerOptions: multer.Options = {
  storage: multer.diskStorage({
    // Upload files to `.sandbox`
    destination: path.join(__dirname, '../.sandbox'),
    // Use the original file name as is
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
};
this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
```

## Use

Start the app:

```sh
npm start
```

The application will start on port `3000`. Open http://localhost:3000 in your
browser. You can try to upload a few files using the web UI or API explorer.

The uploaded files will be stored in `.sandbox` folder under the application
root directory.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
