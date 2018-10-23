// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const SAMPLE = [
  'fixtures/a.md',
  'fixtures/b/b.md',
  'fixtures/b/c/c.md',
  'fixtures/ts/Greeter.ts',
];
const Docs = require('../').Docs;

describe('Docs', function() {
  this.timeout(30000);
  it('should load files from the given source', function(done) {
    Docs.parse(
      {
        content: SAMPLE,
        root: __dirname,
      },
      function(err, docs) {
        assert.equal(docs.content.length, 4);
        done();
      },
    );
  });

  it('should parse sections from each file', function(done) {
    Docs.parse(
      {
        content: SAMPLE,
        root: __dirname,
      },
      function(err, docs) {
        assert.equal(docs.sections.length, 17);
        done();
      },
    );
  });

  it('ignores error for config with section placeholders only', function(done) {
    Docs.parse(
      {
        content: [{title: 'a-title'}],
      },
      function(err) {
        assert(err, 'Docs.parse failed with an error');
        done();
      },
    );
  });

  it('should have unique anchors', function() {
    const docs = new Docs();
    const samples = [
      'Model.validatesNumericalityOf',
      'Model.validatesNumericalityOf',
      'foo',
      'foo',
      'foo',
      'foo bar',
      'foo bar',
    ];

    const expected = [
      'model-validatesnumericalityof',
      'model-validatesnumericalityof-1',
      'foo',
      'foo-1',
      'foo-2',
      'foo-bar',
      'foo-bar-1',
    ];

    samples.forEach(function(s, i) {
      assert.equal(docs.getUniqueAnchor(s), expected[i]);
    });
  });

  it('should be able to generate html', function(done) {
    Docs.toHtml(
      {
        content: SAMPLE,
        root: __dirname,
      },
      function(err, html) {
        assert(!err);
        const doctype = '<!DOCTYPE html>';
        assert.equal(html.substr(0, doctype.length), doctype);
        done();
      },
    );
  });

  it('should error when a file does not exist', function(done) {
    Docs.parse(
      {
        content: ['does-not-exist'],
        root: __dirname,
      },
      function(err, docs) {
        assert(err);
        assert.equal(err.message, 'no matching files were found');
        done();
      },
    );
  });

  describe('.readConfig(options, fn)', function() {
    it('should read a config file', function(done) {
      Docs.readConfig(
        {
          configPath: path.resolve(__dirname, '../docs.json'),
          packagePath: path.resolve(__dirname, '../package.json'),
        },
        function(err, config) {
          if (err) {
            done(err);
          } else {
            assert.equal(config.assets, 'assets');
            assert.equal(config.content[0], 'README.md');
            assert.equal(config.package.name, '@loopback/tsdocs');
            done();
          }
        },
      );
    });
  });

  describe('complex headers', function() {
    it('should not include markdown', function(done) {
      Docs.parse(
        {
          content: ['fixtures/complex-headers.md'],
          root: __dirname,
        },
        function(err, docs) {
          const sections = docs.content[0].sections;
          assert.equal(sections[0].title, 'complex-headers');
          assert.equal(sections[1].title, 'link');
          assert.equal(sections[2].title, 'bold header');
          assert.equal(sections[3].title, 'code.header');
          assert.equal(sections[4].title, 'slc create');
          assert.equal(sections[5].title, 'workspace');
          done();
        },
      );
    });
  });
});
