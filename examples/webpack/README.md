# @loopback/example-webpack

This example illustrates how to bundle `@loopback/core` using
[webpack](https://webpack.js.org/) to allow LoopBack's Dependency Injection can
be run inside a browser.

## Webpack configurations

We add `webpack.config.js` to define two configurations for Node.js and Web.

## Use

Use one of the following commands to build `dist/bundle-web.js` to package this
example application into a JavaScript file for browsers.

```sh
npm run build:webpack-web
```

```sh
npx webpack --config-name web
```

Now `dist/bundle-web.js` can be used for HTML pages, for example:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>LoopBack 4 Core Modules WebPack Demo</title>
    <script src="dist/bundle-web.js" charset="utf-8"></script>
  </head>
  <body>
    <div id="greetings"></div>

    <script>
      async function greet() {
        const element = document.getElementById('greetings');

        // Exported TypeScript functions/classes/types/constants are now
        // available under `LoopBack` namespace
        const greetings = await LoopBack.main();

        const list = greetings.map(g => `<li>${g}</li>`);
        element.innerHTML = `
  <h1>Hello from LoopBack</h1>
  <p/>
  <ul>
    ${list.join('\n')}
  </ul>`;
        return greetings;
      }

      greet().catch(err => alert(err));
    </script>
  </body>
</html>
```

Open `index.html` in a browser, you'll see LoopBack is now running inside the
browser as client-side JavaScript:

```
Hello from LoopBack:
[2020-09-14T07:54:09.220Z] (en) Hello, Jane!
[2020-09-14T07:54:09.227Z] Hello, John!
[2020-09-14T07:54:09.230Z] (zh) 你好，John！
[2020-09-14T07:54:09.231Z] (en) Hello, Jane!
```

## CDN

Once the package is published to npm, we can use `unpkg` as the CDN using one of
the following flavors:

```html
<script src="https://unpkg.com/@loopback/example-webpack" crossorigin></script>
<script
  src="https://unpkg.com/@loopback/example-webpack@0.1.0"
  crossorigin
></script>
<script
  src="https://unpkg.com/@loopback/example-webpack@0.1.0/dist/bundle-web.js"
  crossorigin
></script>
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
