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
`sandbox` directory, for example, `sandbox/example`.

To link the `@loopback/*` dependencies for your project, run the following
commands:

```sh
cd loopback-next
npm install
npm run build
cd sandbox/example
node .
```

Your project is now ready against the LoopBack 4 source code.
