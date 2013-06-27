![Strong Docs](assets/logo.png)

## Overview

Create a single page documentation site for your node.js module using a set of [documentation source files](#documentation-source-files) including **github flavored markdown** and **JSDoc annotated JavaScript**.

## Install

    npm install strongloop/strong-docs -g

## Getting Started

Create a set of markdown files in a directory. Each markdown file should follow the basic [strong docs markdown conventions](#markdown-conventions). In order to parse a set of content, strong-docs requires a `docs.json` config file. Here is a simple example:

docs.json

    {
      "content": [
        "README.md",
        "docs/overview.md",
        "docs/guides.md",
        "docs/api.md",
        "lib/foo.js",
        "lib/bar.js"
      ]
    }

This config file should specify every [documentation source file](#documentation-source-files) you wish to be included in your site generation.

## Building

To build a static html version of your doc site run the strong docs cli in your project directory or specify the path to your `docs.json` config. The `--out` argument is required.

```sh
# in the same directory as docs.json
$ sdocs --out my-doc-site

# or specify the path to your config
$ sdocs --config path/to/my/docs.json --out my-doc-site
```

## Preview

To preview your docs while editing run the strong docs cli with the `--preview` argument. This will start a server that builds and renders your doc site every time you refresh your browser.

```sh
# start the preview server
$ sdocs --preview

# specify a port (default: 3000)
$ sdocs --preview --port 8080
```

## Sections

Each file read by strong-docs (markdown, or JavaScript) is parsed into a set of nested sections. The parser relies on the file being formated using the [markdown](#javascript-conventions) or [JavaScript](#javascript-conventions) conventions.

Since the output of strong-docs is a single html page, the input (markdown or JavaScript) is treated as a single page before parsing. This means that you can organize your docs into multiple files, but must be aware that references (links, names, etc) will all be global.

### Section Depth

#### Markdown

Each section parsed from markdown has a specified depth. Markdown file's section depth is determined by the type of header the parser finds. In markdown the `## foo` header is parsed as `<h2>foo</h2>` with a depth of `2`.

#### JavaScript

JavaScript annotation sections all have the same preset depth. This value can be changed using the ``


### Injecting Sections

You may add sections that were not discovered by parsing your documentation files using the `content` [config](#config) setting. Here is an example that adds a header and section to each js file.

    [
      "docs/overview.md",
      "docs/guides.md",
      "docs/api.md",
      {"title": "Foo API", "depth": 2},
      "lib/foo.js",
      {"title": "Bar API", "depth": 2},
      "lib/bar.js"
    ]

The `depth` attribute of the section object will set the sections depth and navigation header style.

## Documentation Source Files

Strong-docs requires a list of files to use for generating your documentation site. This list may contain markdown files, JavaScript files, and section objects.

Strong-docs can parse markdown and [dox](https://github.com/visionmedia/dox) style JavaScript. Strong-docs is fairly good at determining your intended structure. Following the conventions below will ensure your docs site is compatible with strong-docs.

### Markdown Conventions

Strong-docs uses [Github Flavored Markdown](http://github.github.com/github-flavored-markdown/) for parsing its markdown as well as generating section anchors.

#### Sections

To create a section you only need to provide a markdown header eg. `#` or `###`. The following example creates several sections.

    # My Section

    This is a paragraph.

    ## Sub Section

    This is a paragraph within a sub section.

The first section `# My Section` will have a depth of 1 and the second's depth will be 2. See (section depth)[#section-depth] for more info.

#### Links / Anchors

Each section gets its own unique anchor. The title of the section is turned into a url compatible string. Here are a couple examples.

    header                 anchor
    # Foo Bar              #foo-bar
    # foo/bar              #foobar
    # foobar               #foobar-1

If an anchor already exists, a number will be added to the end to ensure it is unique.

#### Code

Both [Github Flavored Markdown](http://github.github.com/github-flavored-markdown/) and normal markdown code samples are supported. To enable syntax highlighting explicitely specify the language like the example below. Syntax highlighting uses [highlight.js](https://github.com/isagalaev/highlight.js). See a list of supported languages [here](http://softwaremaniacs.org/media/soft/highlight/test.html);

    ```javascript
    var a = b + c;
    ```

#### Images

Strong-docs supports linking to images absolutely (using regular markdown):

    ![Alt text](http://foo.com/path/to/img.jpg)
    ![Alt text](http://foo.com/path/to/img.jpg "Optional title")

Or you can bundled your images with your site using the [assets setting](#assets).

    {
      "content": [...],
      "assets": "path/to/assets"
    }

Now any image can be referenced like this:

    ![Alt text](assets/img.jpg)

### JavaScript Conventions

#### Annotations

Strong-docs will parse `.js` files for [JSDoc](http://usejsdoc.org/) annotations using the [dox](https://github.com/visionmedia/dox#dox) parser.

Annotation may contain markdown. This markdown will be rendered as HTML but will not be parsed for [sections](#sections). Here is a basic example.

```js
/**
 * Escape the given `html`.
 *
 * **Example:**
 *
 *     utils.escape('<script></script>')
 *     // => '&lt;script&gt;&lt;/script&gt;'
 *
 * @param {String} html The string to be escaped
 * @return {String}
 * @api public
 */

exports.escape = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};
```

See the [JSDoc](http://usejsdoc.org/) site for more examples.

##### Ignoring Annotations

To ignore an annotation change the comment block from `/**` to `/*!`.

```js
/*!
 * My ignored annotation example...
 *
 * @myparam My value...
 */

// ...
```

You can also use the `@private` attribute to prevent your annotation from being rendered in your doc site.

```js
/**
 * My private annotation example...
 *
 * @myparam My value...
 * @private
 */

// ...
```

#### Sections

Sections are created for each [JSDoc](http://usejsdoc.org/) annotation. If you want to further organize your api docs you can inject sections using the "content" config setting. [Here is an example](#injecting-sections).

#### Links / Anchors

Each annotation gets its own unique anchor. The title of the annotation is turned into a url compatible string. Here are a couple examples. **Note:** anything in parenthesis will be removed.

    header                 anchor
    # app.get(foo, bar)    #app.get
    # app.get()            #app.get-1

## Config

The following is a list of configuration properties for strong-docs. You may specify these values as a `docs.json` file or as an `Object` using the `node.js` api.

### Available Options

 - **title** - the title of your documentation site
 - **version** - the version of the project you are documenting
 - **content** - default: 'content' - specify your [documentation source files](#documentation-source-files)
 - **codeSectionDepth** - default `4` - specify the depth of [JavaScript sections](#section-depth)
 - **assets** - path to your assets directory

### Content

Documentation will be rendered in the order it is listed in the content array. Below is an example content array with markdown, JavaScript, and an injected section.

    [
      "docs/overview.md",
      "docs/guides.md",
      "docs/api.md",
      {"title": "API", "depth": 2},
      "lib/foo.js",
      "lib/bar.js"
    ]

[Glob patterns](https://github.com/isaacs/node-glob) are supported for the items.

    [
        "docs/overview.md",
        "docs/guides.md",
        "docs/api.md",
        {"title": "API", "depth": 2},
        "lib/*.js"
    ]

**In the example above, the order of top-level items is still honored while files matching the wildcard are sorted.**

### Assets

Bundle a set of files, such as images, with your documentation. This directory will be copied recursively into your doc site as `site/assets`. The name will not be preserved.

Link to these files from your docs like this:

    ![Alt text](assets/img.jpg)
    [My File](assets/pkg.zip)

## JSDoc Annotations

### Supported annnotations

* author
* callback
* class
* classdesc
* constant
* constructor
* deprecated
* desc
* end
* file
* header
* ignore
* instance
* memberof
* method
* module
* name
* overview
* options
* param
* private
* property
* public
* returns
* static
* summary

###Not supported

* abstract
* access
* alias
* augments
* borrows
* constructs
* copyright
* default
* enum
* event
* example
* exports
* external
* fires
* global
* inner
* kind
* lends
* license
* link
* member
* mixes
* mixin
* namespace
* protected
* readonly
* requires
* see
* since
* this
* throws
* todo
* tutorial
* type
* typedef
* variation
* version

### StrongLoop annnotations

#### promise

Syntax: `@promise [{Types}] [resolve object]`

`Types` and `resolve object` must be specified for a promise-only function.

```
/**
 * Function to test a standalone promise.
 *
 * @param {Array} An array parameter.
 * @promise {Array} Resolves an Array.
 *
 */
function promiseStandalone(arg) {

}
```

`Types` and `resolve object` are optional if the function also accepts a callback.
The promise details are derived from the callback.

```
/**
* Function to test promise from a callback.
*
* @param {Array} An array parameter.
*
* @callback {Function} callback This is the callback.
* @param {Error} err Error object.
* @param {Object} instance Model instance.
*
* @promise
*
*/
function promiseCallback(arg, callback) {

}
```

Specifying `Types` and `resolve object` will overwrite the defaults derived from
the callback.

```
/**
* Function to test custom promise details.
*
* @param {Array} An array parameter.
*
* @callback {Function} callback This is the callback.
* @param {Error} err Error object.
* @param {Object} instance Model instance.
*
* @promise {String} Custom resolve object of type String.
*
*/
function promiseCustom(arg, callback) {

}
```

A warning message will be printed on the console and the documentation page,
if the promise cannot be meaningfully resolve with respect to the callback
implementation.

```
/**
* Function to test unresolvable promise from a callback.
*
* @param {Array} An array parameter.
*
* @callback {Function} callback This is the callback.
* @param {Error} err Error object.
* @param {Object} instanceA first Model instance.
* @param {Object} instanceB second Model instance.
* @promise
*
*/
function promiseUnresolvable(arg, callback) {

}
```
