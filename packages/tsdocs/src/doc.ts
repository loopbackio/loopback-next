// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as ejs from 'ejs';
import * as hljs from 'highlight.js';
import * as marked from 'marked';
import * as path from 'path';
import * as string from 'underscore.string';
import {Annotation} from './annotation';
import {Docs} from './docs';
import {Comment} from './dox';
import {Options, Section} from './ts-helper';

const languageAlias: {[name: string]: string} = {
  sh: 'bash',
  js: 'javascript',
};

// setup marked options
const markedOptions = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-',
  // available languages http://softwaremaniacs.org/media/soft/highlight/test.html
  highlight: function(code: string, lang: string) {
    let result;

    try {
      if (languageAlias[lang]) lang = languageAlias[lang];
      if (lang) result = hljs.highlight(lang, code).value;
      else result = hljs.highlightAuto(code).value;
    } catch (e) {
      console.warn(
        'Could not highlight the following with language "%s"',
        lang,
      );
      console.warn(code);
      result = code;
    }

    return result;
  },
};

export class Doc {
  filename: string;
  markedOptions: Options;
  commentTemplate: string;
  sections: Section[];
  classes: Annotation[];
  methods: Annotation[];
  properties: Annotation[];
  html?: string;

  /**
   * Create a document from a file path and its contents.
   *
   * @param {String} file The file path
   * @param {String} contents The file contents
   * @param {Boolean} isJS Is the document JavaScript
   * @param {Docs} docs The parent docs object
   * @constructor
   */

  constructor(
    public file: string,
    public contents: string,
    public isJS: boolean,
    public docs: Docs,
  ) {
    this.markedOptions = markedOptions;
    this.filename = path.basename(file);

    // parse sections
    this.sections = [];
    this.classes = [];
    this.methods = [];
    this.properties = [];

    this.commentTemplate = docs.commentTemplate;
    try {
      if (isJS) {
        this.parseJavaScript();
      } else {
        this.parseMarkdown();
      }
    } catch (e) {
      console.error('Failed to parse %s', this.filename, e);
    }
  }

  /**
   * Parse the `doc.contents` as JSDoc annotated JavaScript.
   */
  parseJavaScript() {
    console.warn('Skipping JavaScript file %s', this.filename);
  }

  /**
   * Parse the `doc.contents` as markdown.
   */

  parseMarkdown() {
    let tokens = marked.lexer(this.contents, markedOptions);
    let sections = this.sections;
    let docs = this.docs;
    // tslint:disable-next-line:no-any
    let finalTokens: marked.TokensList = [] as any;

    for (const token of tokens) {
      if (token.type === 'heading') {
        let rawHeader = token.text;

        // remove markdown formatting
        rawHeader = rawHeader.replace(/\*\*/g, '');

        let anchor = docs.getUniqueAnchor(rawHeader);

        sections.push({
          title: stringToTitle(rawHeader),
          depth: token.depth,
          anchor: anchor,
        });

        finalTokens.push({
          type: 'html',
          text: '<a name="' + anchor + '"></a>',
          pre: false,
        });
      }

      finalTokens.push(token);
    }

    finalTokens.links = tokens.links;
    this.html = marked.parser(finalTokens, markedOptions);
  }

  getClasses() {
    return this.classes.sort((a, b) => {
      const x = a.section.title.split('Class:').pop()!;
      const y = b.section.title.split('Class:').pop()!;
      return x.localeCompare(y);
    });
  }

  /**
   * Render a code comment/annotation and section using the inherited template.
   * @param {Object} comment The comment to render
   * @param {Object} section The section to render
   */

  renderComment(comment: Comment, section: Section) {
    return ejs.render(this.commentTemplate, {
      comment: comment,
      section: section,
    });
  }
}

function stringToTitle(str: string) {
  let html = marked.parse(str);

  // html back to string
  str = html.replace(/<.+?>/g, '');

  // remove function arguments
  str = str.replace(/\(.+\)/g, '');
  str = str.replace('()', '');

  // remove anything in angle bracks
  str = str.replace(/\[.+?\]/g, '');

  return string.trim(str);
}
