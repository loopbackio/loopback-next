// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: string-docs
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

const dox = require('dox');

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
        lang
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
    public docs: Docs
  ) {
    let doc = this;
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
        this.classes = this.classes.sort(function(a, b) {
          return a.section!.title.localeCompare(b.section!.title);
        });
        this.classes.forEach(function(classAnnotation) {
          renderClass(classAnnotation);
          if (
            'classDesc' in classAnnotation &&
            docs.renderedClasses.indexOf(classAnnotation.classDesc) < 0
          ) {
            docs.renderedClasses.push(classAnnotation.classDesc);
          }
          classAnnotation.methods
            .sort(function(a, b) {
              const x = a.section!.title.split('.').pop()!;
              const y = b.section!.title.split('.').pop()!;
              return x.localeCompare(y);
            })
            .forEach(function(annot) {
              renderMethod(annot, docs.classes[classAnnotation.classDesc]);
            });
        });
      } else {
        this.parseMarkdown();
      }
    } catch (e) {
      console.error('Failed to parse %s', this.filename);
      console.error(e);
    }

    function renderClass(classAnnotation: Annotation) {
      if (!('html' in doc)) doc.html = '';
      if (docs.renderedClasses.indexOf(classAnnotation.classDesc) < 0) {
        doc.html += classAnnotation.render();
      }
    }

    function renderMethod(a: Annotation, appendToClass: Annotation) {
      try {
        if (!('html' in doc)) doc.html = '';
        if (appendToClass) appendToClass.html += a.render();
        else doc.html += a.render();
      } catch (e) {
        console.error('Failed to render:', a);
        console.error(e);
      }
    }
  }

  /**
   * Parse the `doc.contents` as JSDoc annotated JavaScript.
   */

  parseJavaScript() {
    let comments = dox.parseComments(this.contents, {raw: true});
    let sections = this.sections;
    let docs = this.docs;
    let currentClass;

    for (const annotationObject of comments) {
      let a = new Annotation(annotationObject, this);
      let type;

      if (!a.ignore) {
        type = a.determineType();
        switch (type) {
          case 'class':
            this.classes.push(a);
            currentClass = a;
            break;
          case 'instance':
          case 'static':
          case 'method':
          case 'function':
            if (currentClass) {
              currentClass.methods.push(a);
            } else {
              this.methods.push(a);
            }
            break;
          case 'property':
            if (currentClass) {
              currentClass.propertyAnnotations.push(a);
            } else {
              this.properties.push(a);
            }
            break;
        }

        if (
          !(
            annotationObject.tags.length > 0 &&
            annotationObject.tags[0].type === 'class' &&
            annotationObject.tags[0].string in docs.classes
          )
        ) {
          sections.push(a.section!);
        }
      }
    }
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
    return this.classes.sort(function(a, b) {
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
