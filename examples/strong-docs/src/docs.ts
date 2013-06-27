import {exec} from 'child_process';
import * as ejs from 'ejs';
import * as fs from 'fs';
import {sync as glob} from 'glob';
import * as path from 'path';
import * as _ from 'underscore.string';
import {Doc} from './doc';
import {AnyObject, Options, Section} from './ts-helper';
import {TSParser} from './ts-parser';
import {TSConstruct} from './ts-construct';

const TaskEmitter = require('strong-task-emitter');
const COMMENT_TEMPLATE = path.join(__dirname, '../templates/annotation.ejs');

// tslint:disable-next-line:no-any
export type Callback<T = any> = (
  err?: Error | null | undefined,
  result?: T
) => void;

export interface ContentTitle {
  title: string;
  depth: number;
}

export interface DocsConfig {
  content: (string | ContentTitle)[];
  codeSectionDepth?: number;
  assets?:
    | string
    | {
        [key: string]: string;
      };
  extensions: string[];
  order?: string[];
  fileSections?: boolean;
  package?: AnyObject;

  typedoc?: Options;

  // Docs template
  template?: string;

  // Comment template
  commentTemplate?: string;

  init?: string;

  // Root directory
  root?: string;
}

export interface TSDoc {
  classes: TSConstruct[];
  sections: Section[];
  html: string;
  isJS?: boolean;
  file?: string;
}
/**
 * Create a new set of `Docs` with the given `config`.
 *
 * @param {DocsConfig} config
 * @return {Docs}
 */

export class Docs {
  root: string;
  config: DocsConfig;
  content: (Doc | TSDoc)[];
  sections: Section[];
  renderedClasses: string[];
  commentTemplate: string;
  anchors: AnyObject;
  classes: AnyObject;

  constructor(config: DocsConfig) {
    this.content = [];
    this.sections = [];
    this.renderedClasses = [];

    // defaults
    config = config || {};
    config.content = config.content || ['*.md'];
    config.extensions = config.extensions || ['.markdown', '.md', '.js', '.ts'];
    if (config.fileSections !== false) {
      config.fileSections = true;
    }
    if (!Array.isArray(config.content)) {
      config.content = [config.content];
    }
    let root = (this.root = config.root || process.cwd());
    this.config = config;

    if (this.config.order) {
      // resolve order paths
      this.config.order = this.config.order.map(function(p: string) {
        return path.resolve(root, p);
      });
    }

    this.commentTemplate = fs.readFileSync(
      config.commentTemplate || COMMENT_TEMPLATE,
      'utf8'
    );
  }

  /**
   * Parse all content in the given [config](#config) and callback with a `Docs`
   * object.
   *
   * @options  {Object} config
   * @property {String} [title] The title of your documentation site
   * @property {String} [version] The version of the project you are documenting
   * @property {Array}  content Specify your [documentation source files](#documentation-source-files)
   * @property {Number} [codeSectionDepth=4] Specify the depth of [JavaScript sections](#section-depth)
   * @property {String} [assets] Path to your assets directory
   * @end
   * @callback {Function} callback
   * @param {Error} err
   * @param {Docs} docs The `Docs` object
   */

  static parse(config: DocsConfig, fn: Callback<Docs>) {
    let docs = new Docs(config);
    docs.parse(function(err?: Error) {
      fn(err, err ? undefined : docs);
    });
  }

  static readJSON(file: string, fn: Callback<AnyObject>) {
    fs.readFile(file, 'utf8', function(err, str) {
      let isEmptyFile =
        (err && err.code === 'ENOENT') || str.replace(/\s/g, '') === '';
      let seriousError = err && !isEmptyFile;

      if (seriousError) {
        fn(err);
      } else if (isEmptyFile) {
        fn();
      } else {
        try {
          const object = JSON.parse(str);
          fn(null, object);
        } catch (e) {
          return fn(e);
        }
      }
    });
  }

  /**
   * Read the config and package at paths in the given options.
   *
   * @options {Object} options
   * @prop {String} [configPath] The path (relative to cwd) to docs.json
   * @prop {String} [packagePath] The path (relative to cwd) to package.json
   * @end
   * @callback {Function} callback
   * @param {Error} err An error if one occurred loading either the docs.json or package.json
   * @param {Object} config The config object loaded from `options.configPath`
   */

  static readConfig(options: Options, fn: Callback<DocsConfig>) {
    options = options || {};
    let configPath = options.configPath || 'docs.json';
    let packagePath = options.packagePath || 'package.json';

    Docs.readJSON(configPath, function(err, config: DocsConfig) {
      if (err) {
        err.message = 'Could not load config data: ' + err.message;
        fn(err);
      } else {
        // default config
        config = config || {};
        Docs.readJSON(packagePath, function(err2, pkg) {
          if (err2) {
            err2.message = 'Could not load package data: ' + err2.message;
            fn(err2);
          } else {
            pkg = pkg || undefined;
            config!.package = pkg;
            fn(null, config);
          }
        });
      }
    });
  }

  private static findFiles(root: string, f: string) {
    let files = glob(f, {cwd: root, nonull: false});
    return files;
  }

  parse(fn: Function) {
    let self = this;
    let content = this.config.content;
    let init = this.config.init;
    let root = this.root;
    let cwd = process.cwd();
    let te = new TaskEmitter();
    let files: {[name: string]: string} = {};
    let matchedFiles: string[] = [];
    let tsFiles: string[] = [];
    // reference to individual classes
    this.classes = {};
    te.on('error', fn);
    te.on('done', () => {
      matchedFiles.forEach((f: string) => {
        let contents;

        if (typeof f === 'object') {
          contents = Docs.fauxSectionToMarkdown(f);
          let fauxdoc = new Doc('faux-section.md', contents, false, this);
          this.content.push(fauxdoc);
        } else {
          f = path.resolve(root, f);
          if (path.extname(f) === '.ts') {
            // Filter out ts files, and process them as a bunch
            tsFiles.push(f);
            return;
          }
          contents = files[f];
          if (this.hasExt(f)) {
            let doc = new Doc(f, contents, path.extname(f) === '.js', self);
            doc.classes.forEach(function(c) {
              if (!(c.classDesc in self.classes)) {
                self.classes[c.classDesc] = doc;
              }
            });
            self.content.push(doc);
          }
        }
      });
      // Process ts files
      if (tsFiles.length > 0) {
        let tsParser = new TSParser(tsFiles, this.config.typedoc);
        let parsedData = tsParser.parse();
        let doc = {
          classes: parsedData.constructs,
          sections: parsedData.sections,
          html: '',
        };
        doc.classes.forEach(function(tsConstruct) {
          doc.html += tsConstruct.render();
        });
        self.content.push(doc);
      }
      this.buildSections();
      fn();
    });

    te.on('readdir', (f: string, dir: string[]) => {
      dir.forEach(function(df) {
        te.task(fs, 'stat', path.join(f, df));
      });
    });

    te.on('stat', (f: string, stat: fs.Stats) => {
      if (stat.isDirectory()) {
        te.task(fs, 'readdir', f);
      } else {
        te.task(fs, 'readFile', f, 'utf8');
      }
    });

    te.on('readFile', (f: string, enc: string, contents: string) => {
      files[f] = contents;
    });

    te.on('init', () => {
      content.forEach((p: string) => {
        if (typeof p === 'string') {
          let matched = Docs.findFiles(root || cwd, p);
          matched.forEach(function(f) {
            if (matchedFiles.indexOf(f) === -1) {
              matchedFiles.push(f);
            }
          });
        } else {
          matchedFiles.push(p);
        }
      });

      matchedFiles.forEach((p: string) => {
        if (typeof p === 'string') {
          let f = path.join(root || cwd, p);
          if (self.hasExt(f)) {
            te.task(fs, 'readFile', f, 'utf8');
          } else {
            te.task(fs, 'stat', f);
          }
        }
      });
      if (!te.remaining()) {
        te.emit('error', new Error('no matching files were found'));
      }
    });

    if (init) {
      te.task('init', (cb: Callback) => {
        let opts = {
          cwd: root || process.cwd(),
          timeout: 2000 /* milliseconds */,
        };
        exec(init!, opts, cb);
      });
    } else {
      te.emit('init');
    }
  }

  hasExt(f: string) {
    return ~this.config.extensions.indexOf(path.extname(f));
  }

  buildSections() {
    let sections = this.sections;
    let order = this.config.order;
    let files = this.content;
    let content = this.content;
    let root = this.root;

    // order content using index
    if (Array.isArray(order)) {
      files = content.sort((a, b) => {
        let pathA = path.resolve(root, a.file!);
        let pathB = path.resolve(root, b.file!);
        let indexA = order!.indexOf(pathA);
        let indexB = order!.indexOf(pathB);

        if (indexA === indexB) return 0;
        return indexA > indexB ? 1 : -1;
      });
    }

    for (const f of files) {
      f.sections.forEach((s: Section) => {
        sections.push(s);
      });
    }
  }

  getUrlSafeAnchor(title: string) {
    return _.slugify(title.toLowerCase().replace(/\./g, '-'));
  }

  getUniqueAnchor(title: string): string {
    let anchors = (this.anchors = this.anchors || {});
    let anchor;
    let urlSafe = this.getUrlSafeAnchor(title);
    let isUsed = anchors[urlSafe];

    if (!urlSafe) {
      return '';
    }

    if (isUsed) {
      let split = urlSafe.split('');
      let lastCharIndex = split.length - 1;
      let lastChar = split[lastCharIndex];
      let num = parseInt(lastChar);
      let isNum = !isNaN(num);

      if (isNum) {
        split[lastCharIndex] = (num + 1).toString();
      } else {
        split.push('-1');
      }
      anchor = this.getUniqueAnchor(split.join(''));
    } else {
      anchor = urlSafe;
    }

    // index anchor
    anchors[anchor] = true;

    return anchor;
  }

  /**
   * Render the given [config](#config) as html.
   *
   * @param {Object} config
   * @param {Function} callback
   */

  static toHtml(config: DocsConfig, fn: Callback<string>) {
    let template =
      config.template || path.join(__dirname, '..', 'templates', 'docs.ejs');

    Docs.parse(config, function(err: Error | undefined, docs: Docs) {
      if (err) {
        return fn(err);
      }

      ejs.renderFile(template, {docs: docs}, function(err2, html) {
        if (err2) {
          fn(err2);
        } else {
          docs.postProcessHtml(html!, fn);
        }
      });
    });
  }

  private static fauxSectionToMarkdown(section: Section) {
    let md = '';
    const n = section.depth;

    for (let i = 0; i < n; i++) {
      md += '#';
    }

    md += ' ' + section.title;

    return md;
  }

  /**
   * A hook to do any post-processing of the HTML before `toHtml` signals its
   * completion.
   *
   * @param  {String}   html     The fleshed-out HTML.
   * @param  {Function} callback A Node-style callback.
   * @return {Docs}              The Docs instance, for cascading.
   */
  postProcessHtml(html: string, callback: Callback<string>) {
    let pkg = this.config.package;
    let version = pkg && pkg.version;

    if (version) {
      callback(null, addVersion(html));
    } else {
      callback(null, html);
    }

    return this;

    // We want to add and de-emphasize the version number within the content's
    // main title.
    function addVersion(htmlStr: string) {
      // This is the poor man's version of $('h1').get(0).html(...)
      // TODO(schoon) - Add DOM-aware post-processing capabilities, i.e. jsdom.
      return htmlStr.replace('</h1>', ' <small>v' + version + '</small></h1>');
    }
  }

  getAllMarkdown() {
    return this.content
      .filter(doc => {
        return !doc.isJS;
      })
      .sort(alpha);
  }

  getMarkdownSections() {
    let sections: Section[] = [];
    this.getAllMarkdown().forEach((doc: Doc | TSDoc) => {
      sections = sections.concat(doc.sections);
    });
    return sections;
  }

  getAllModules() {
    return this.content
      .filter(function(doc) {
        return doc.isJS;
      })
      .sort(alpha);
  }
}

function alpha(a: {file?: string}, b: {file?: string}) {
  const x = a.file || '';
  const y = b.file || '';
  return x.localeCompare(y);
}
