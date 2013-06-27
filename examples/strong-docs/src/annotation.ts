// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: string-docs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import * as debugModule from 'debug';
import * as ejs from 'ejs';
import * as marked from 'marked';
import * as _ from 'underscore.string';
import {Doc} from './doc';
import {Docs} from './docs';
import {Comment, Tag, Context} from './dox';
import {Section, AnyObject} from './ts-helper';

const debug = debugModule('strong-docs:Annotation');

/**
 * Create a strong-docs annotation object from a **dox** comment.
 *
 * @param {Comment} comment A raw dox comment
 * @param {Docs} docs The parent Docs object
 * @class
 */

export class Annotation {
  classDesc: string;
  propertyAnnotations: Annotation[];
  moduleExample: string;
  rawComment: Comment;
  commentTemplate: string;
  tags: Tag[];
  doc: Doc;
  docs: Docs;
  attrs: AnyObject;
  ignore?: boolean;
  section: Section;
  header: string;
  sectionTitle: string;
  anchor: string;
  html: string;
  type: string;
  args: Tag[];
  isConstructor: boolean;
  methods: Annotation[];
  callbackTag?: Tag;

  promise?: AnyObject;
  optionsTag: Tag;

  static readonly aliases: {[name: string]: string} = {
    function: 'method',
    file: 'overview',
    prop: 'property',
    desc: 'description',
  };

  private parseTagForType(tag: Tag) {
    const parts = tag.string ? tag.string.split(/ +/) : [];
    tag.types = parseTypes(parts.shift());
    tag.name = parts.shift();
    tag.description = parts.join(' ');
  }

  private _setProperty(tag: Tag) {
    this.attrs[tag.type!] = tag.string || true;
  }

  private readonly setProperty = this._setProperty.bind(this);

  private tagParsers: {[type: string]: (tag: Tag, ctx?: Context) => void} = {
    abstract: notSupported,
    access: notSupported,
    alias: notSupported,
    augments: notSupported,
    author: this.setProperty,
    borrows: notSupported,
    callback: (tag: Tag) => {
      this.parseTagForType(tag);
      tag.args = [];
      this.tagParsers.param(tag);
      this.callbackTag = tag;
    },
    class: this.setProperty,
    classdesc: this.setProperty,
    constant: this.setProperty,
    constructor: this.setProperty,
    constructs: notSupported,
    copyright: notSupported,
    default: notSupported,
    deprecated: this.setProperty,
    description: this.setProperty,
    enum: notSupported,
    event: notSupported,
    example: this.setProperty,
    exports: notSupported,
    external: notSupported,
    end: () => {},
    file: this.setProperty,
    fires: notSupported,
    global: notSupported,
    header: this.setProperty,
    ignore: this.setProperty,
    inner: notSupported,
    instance: this.setProperty,
    kind: notSupported,
    lends: notSupported,
    license: notSupported,
    link: notSupported,
    member: notSupported,
    memberof: this.setProperty,
    method: this.setProperty,
    mixes: notSupported,
    mixin: notSupported,
    module: this.setProperty,
    name: this.setProperty,
    namespace: notSupported,
    overview: this.setProperty,
    options: (tag: Tag) => {
      this.parseTagForType(tag);
      tag.properties = [];
      this.tagParsers.param(tag);
      this.optionsTag = tag;
    },
    param: (tag: Tag) => {
      if (tag.description) {
        if (tag.description[0] === '-') {
          tag.description = tag.description.replace('-', '');
        }
      }
      mapStarToAny(tag);
      if (this.callbackTag) {
        this.callbackTag!.args!.push(tag);
      } else {
        this.args = this.args || [];
        this.args.push(tag);
      }
    },
    private: this.setProperty,
    promise: (tag: Tag, ctx: Context) => {
      let resolveObject: Tag = {name: 'resolve'};
      if (!tag.types) {
        this.parseTagForType(tag);
        if (tag.name) tag.description = tag.name + ' ' + tag.description;
        tag.name = undefined;
      }
      tag.name = tag.name || 'promise';
      mapStarToAny(tag);
      this.promise = {};
      this.promise.attrs = [];
      // assign the input object types
      if (this.args.length) {
        this.promise.types = this.args[0].types;
      }
      // try to fill in the promise details from Callback properties
      if ('callbackTag' in this) {
        const args = this.callbackTag!.args!;
        if (args.length === 1) {
          console.log('Resolve object not found in %s', ctx.string);
          resolveObject.types = ['undefined'];
          resolveObject.description =
            'The resolve handler does not receive any arguments.';
        } else if (args.length === 2) {
          resolveObject.types = args[1].types;
          resolveObject.description = args[1].description;
        } else {
          let warningMessage = 'Promise cannot be resolved in ' + ctx.string;
          this.promise.warning = warningMessage;
          console.warn(warningMessage);
        }
      }
      // custom description takes precedence over properties from Callback
      if (tag.description) {
        resolveObject.types = tag.types;
        resolveObject.description = tag.description;
      }
      this.promise.attrs.push(resolveObject);
      if (!('description' in resolveObject)) {
        console.warn(
          'Description for resolve object not found in %s',
          ctx.string
        );
      }
    },
    property: function(tag: Tag) {
      if (!tag.types) {
        this.parseTagForType(tag);
      }

      if (this.optionsTag) {
        // @options - before @end
        this.optionsTag.properties.push(tag);
      } else {
        this.properties = this.properties || [];
        this.properties.push(tag);
      }
    },
    protected: notSupported,
    public: this.setProperty,
    readonly: notSupported,
    requires: notSupported,
    returns: (tag: Tag) => {
      if (!tag.types) {
        this.parseTagForType(tag);
        if (tag.name) tag.description = tag.name + ' ' + tag.description;
        tag.name = undefined;
      }
      tag.name = tag.name || 'result';
      mapStarToAny(tag);
      this.attrs.returns = tag;
    },
    see: notSupported,
    since: notSupported,
    static: this.setProperty,
    summary: this.setProperty,
    this: notSupported,
    throws: notSupported,
    todo: notSupported,
    tutorial: notSupported,
    type: notSupported,
    typedef: notSupported,
    variation: notSupported,
    version: notSupported,
  };

  constructor(comment: Comment, doc: Doc) {
    assert(comment);
    assert(doc);
    this.rawComment = patch(comment);
    this.commentTemplate = doc.docs.commentTemplate;
    let tags = (this.tags = comment.tags || []);
    doc = this.doc = doc;
    let docs = (this.docs = doc.docs);
    let attrs: AnyObject = (this.attrs = {});

    tags.forEach(tag => {
      if (tag.type) {
        tag.type = Annotation.aliases[tag.type] || tag.type;
      }

      let shouldParse =
        typeof tag === 'object' && typeof tag.type === 'string' && tag.type;
      if (shouldParse) {
        let fn = (this.tagParsers[tag.type!] || notSupported).bind(this);
        fn(tag, comment.ctx);
      }

      if (tag.description) {
        tag.description = marked(tag.description, doc.markedOptions);
      }
    });

    let desc =
      attrs.description /* ngdoc style */ ||
      (comment.description && comment.description.full) /* jsdoc/dox style */;

    if (attrs.ignore || attrs.private || comment.ignore) {
      this.ignore = true;
      return;
    }

    if (attrs.class || attrs.constructor) {
      this.isConstructor = true;
    }

    let type = (this.type = this.determineType());
    let args = this.args;
    let ctx = comment.ctx;
    let name = ctx && ctx.string;
    let functionName = attrs.method;
    let header = '';
    let anchorId = '';
    let memberOf = attrs.memberof;
    if (args) {
      args.forEach(arg => {
        if (!arg.types) return;
        // workaround for dox splitting function types on comma
        // E.g. @param {function(Error=,Object=)}
        const argType = arg.types[0];
        if (
          typeof argType === 'string' &&
          /^[fF]unction\([^\)]+$/.test(argType)
        ) {
          arg.types = [arg.types.join(', ')];
        }
      });
    }

    // @static / @instance + @memberof
    if (!name) {
      switch (type) {
        case 'instance':
        case 'static':
          if (!memberOf) {
            this.ignore = true;
            return;
          }

          if (type === 'instance') {
            name = memberOf + '.prototype.' + functionName;
          } else {
            name = memberOf + '.' + functionName;
          }

          name += '()';
          break;
      }
    }

    if (attrs.name || attrs.alias) {
      name = attrs.name || attrs.alias;
    }

    // build header
    if (typeof attrs.class === 'string') {
      anchorId = header = attrs.class;
    } else if (type === 'overview') {
      header = doc.filename;
      anchorId = 'file-' + header;
      if (!desc) {
        desc = attrs.overview || attrs.file;
      }
    } else if (type === 'module') {
      anchorId = 'module-' + attrs.module;
      header = 'Module: ' + attrs.module;
      this.moduleExample =
        (this.isConstructor ? pascal : camel)(attrs.module) +
        " = require('" +
        attrs.module +
        "')";
    } else if (Array.isArray(args) && args.length && name) {
      let argNames = args
        .filter(t => {
          // do not include `options.foo`
          // in header arg names
          return (t.name || '').indexOf('.') === -1;
        })
        .map(t => t.name)
        .join(', ');

      name = name.replace(/\(\)\s*$/, '');
      header = name + '(' + argNames + ')';
      anchorId = name;
    } else if (name) {
      anchorId = header = name;
    }

    // header modifiers/override
    if (type === 'class') {
      this.methods = [];
      this.propertyAnnotations = [];
      this.sectionTitle = 'Class: ' + header;
      if (typeof this.attrs.class === 'string') {
        this.classDesc = this.attrs.class;
      }
    }
    if (type === 'instance') {
      header = header.replace('.prototype.', '.');
      header = header.slice(0, 1).toLowerCase() + header.slice(1);
    }

    if (typeof attrs.header === 'string') {
      header = attrs.header;
      // Remove function arg signature from the anchor
      anchorId = header.replace(/\(.*$/, '');
    }

    // could not parse annotation
    // ignore this comment
    if (!header) {
      this.ignore = true;
      return;
    }

    if (desc) {
      this.html = this._renderDescriptionHtml(desc);
    } else {
      this.html = '';
      if (typeof name !== 'undefined') {
        console.log('No description found for %s', name);
      }
    }

    if (type === 'class') {
      header = stringToClassHeader(header);
    }

    this.header = header;
    this.sectionTitle = stringToSectionTitle(this.sectionTitle || header);
    this.anchor = docs.getUniqueAnchor(anchorId);
    this.section = this.buildSection();
  }

  /**
   * Determine the type of the annotation.
   *
   * **Types:**
   *
   *  - `class`    - has attribute `@class`
   *  - `instance` - an instance member
   *  - `static`   - a static member
   *  - `overview` - has `@file` or `@overview`
   *  - `default`  - not a defined type
   *
   * **Instance / Static**
   *
   * For `instance` or `static` types, the annotation may have the `@static` or
   * `@instance` attribute. They must also define that they are a member of an
   * object or class using the `@memberof` attribute.
   *
   * ```js
   * /**
   *  * A sample static method.
   *  * @param  {Number} foo
   *  * @param  {Number} bar
   *  * @static
   *  * @memberof MyClass
   *  * ...
   *
   * MyClass.myStaticMethod = function (foo, bar) {
   *   // ...
   * }
   * ```
   *
   * @return {String} type
   */

  determineType() {
    let type = 'default';
    let attrs = this.attrs;
    let rawComment = this.rawComment;
    let ctx = rawComment && rawComment.ctx;
    let commentType = ctx && ctx.type;
    let name = ctx && ctx.string;

    if (attrs.static) {
      type = 'static';
    } else if (attrs.module) {
      type = 'module';
    } else if (attrs.file || attrs.overview) {
      type = 'overview';
    } else if (attrs.instance) {
      type = 'instance';
    } else if (attrs.class) {
      type = 'class';
    } else if (this.args && this.args.length) {
      type = 'method';
    } else if (commentType) {
      type = commentType;
    }

    if (
      type === 'default' ||
      (type === 'method' && name && ~name.indexOf('.prototype.'))
    ) {
      type = 'instance';
    }

    return type;
  }

  /**
   * Build the section object.
   */

  buildSection() {
    let section: Section = {
      title: this.sectionTitle,
      annotation: this,
      anchor: this.anchor,
      depth: this.doc.docs.config.codeSectionDepth || 4,
    };

    switch (this.type) {
      case 'class':
      case 'overview':
      case 'module':
        section.depth -= 1;
        break;
    }

    return section;
  }

  md(str: string) {
    return marked(str, this.doc.markedOptions);
  }

  /**
   * Render the annotation as html.
   */

  render() {
    return ejs.render(this.commentTemplate, {
      ann: this,
      section: this.section,
      md: this.md.bind(this),
    });
  }

  _renderDescriptionHtml(desc: string) {
    // handle @link annotations - see http://usejsdoc.org/tags-link.html
    desc = desc
      // {@link http://some.url.com}
      .replace(/{@link (http[^ }]+)}/g, '[$1]($1)')
      // {@link http://some.url.com Caption Here (after the first space)}
      .replace(/{@link (http[^ }]+) ([^}]+)}/g, '[$2]($1)')
      // {@link someSymbol}
      .replace(/{@link ([^ }]+)}/g, (match, symbol) => {
        return '[' + symbol + '](#' + this.docs.getUrlSafeAnchor(symbol) + ')';
      })
      // {@link someSymbol Caption Here (after the first space)}
      .replace(/{@link ([^ }]+) ([^}]+)}/g, (match, symbol, caption) => {
        return '[' + caption + '](#' + this.docs.getUrlSafeAnchor(symbol) + ')';
      });

    return marked(desc, this.doc.markedOptions);
  }
}

function notSupported(tag: Tag) {
  debug('attribute "@%s" not supported', tag.type);
  debug('tag: %j', tag);
}

function removeArgs(str: string) {
  // remove function arguments
  str = str.replace(/\(.+\)/, '');
  str = str.replace('()', '');
  return str;
}

function stringToSectionTitle(str: string) {
  return removeArgs(str);
}

// monkey patch dox comment
function patch(comment: Comment) {
  comment = comment || {};
  let desc = (comment.description && comment.description.full) || '';

  if (!comment.ignore && ~desc.indexOf('@ignore')) {
    comment.ignore = true;
  }

  return comment;
}

function stringToClassHeader(str: string) {
  if (str.indexOf('var') === 0) return str;
  let result = 'Class: ';
  result += str;
  return result;
}

function camel(str: string) {
  str = _.camelize(str);
  str = str.slice(0, 1).toLowerCase() + str.slice(1);
  return str;
}

function pascal(str: string) {
  return _.classify(str);
}

function parseTypes(str?: string) {
  return (str || '').replace(/[{}]/g, '').split(/ *[|,\/] */);
}

function mapStarToAny(tag: Tag) {
  if (tag.types) {
    tag.types = tag.types.map(function(orig) {
      if (orig === '*') {
        orig = 'Any';
      }
      return orig;
    });
  }
}
