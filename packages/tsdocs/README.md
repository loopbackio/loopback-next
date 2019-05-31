# @loopback/tsdocs

This module provides [API docs](https://github.com/Microsoft/tsdoc) generation
for `@loopback/*` packages.

It's built on top of https://api-extractor.com/:

- https://github.com/Microsoft/web-build-tools/tree/master/apps/api-extractor
- https://github.com/Microsoft/web-build-tools/tree/master/apps/api-documenter

## Basic Use

### Build api reports and doc models

```sh
npm run extract-apidocs -- --report
```

The command above will traverse all TypeScript packages in the monorepo and run
`api-extractor` to generate api reports and doc models into
`loopback-next/docs/apidocs`:

- `reports`: api reports
- `reports-temp`: temporary api reports
- `models`: doc models

### Generate api docs as markdown files

```sh
npm run document-apidocs
```

It runs `api-documenter` to generate markdown files into
`loopback-next/docs/site/apidocs`.

### Update api docs for Jekyll site

```sh
npm run update-apidocs
```

It adds Jekyll metadata to markdown files in `loopback-next/docs/site/apidocs`
and generates `loopback-next/docs/site/apidocs/index.md` as the index page.

To run all steps together:

```sh
npm run build:tsdocs
```

## Installation

```sh
npm install --save @loopback/tsdocs
```

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
