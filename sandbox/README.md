# sandbox

This directory can be used to add applications or modules that need to be tested
against the LoopBack 4 source code (as symbolically linked dependencies). Sub
directories with `package.json` will be picked up by `lerna` as a package of the
`loopback-next` monorepo.

## Usage

To add a new package for sandbox testing:

```sh
git clone git@github.com:strongloop/loopback-next.git
cd loopback-next/sandbox
```

Now you can scaffold your Node.js modules or copy existing projects into the
`sandbox` directory.

To link the `@loopback/*` dependencies against the source code:

```sh
cd loopback/next
npm run bootstrap
```

Your project is ready against the LoopBack 4 source code now.
