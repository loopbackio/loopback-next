var fs = require('fs');
var path = require('path');
var assert = require('assert');
var expect = require('chai').expect;

var SAMPLE = [
  'fixtures/a.md',
  'fixtures/b/b.md',
  'fixtures/b/*.js',
  'fixtures/b/c/c.md',
  'fixtures/ts/Greeter.ts',
];
var Docs = require('../');

describe('Docs', function() {
  it('should load files from the given source', function(done) {
    Docs.parse(
      {
        content: SAMPLE,
        root: __dirname,
      },
      function(err, docs) {
        assert.equal(docs.content.length, 5);
        done();
      }
    );
  });

  it('should parse sections from each file', function(done) {
    Docs.parse(
      {
        content: SAMPLE,
        root: __dirname,
      },
      function(err, docs) {
        assert.equal(docs.sections.length, 19);
        done();
      }
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
      }
    );
  });

  it('should include documentation from external file', function(done) {
    Docs.toHtml(
      {
        content: ['fixtures/js/main-class.js', 'fixtures/js/class-method.js'],
        root: __dirname,
      },
      function(err, docs) {
        assert.equal(docs.split('app.middleware').length, 3);
        done();
      }
    );
  });

  it('should call "init" script', function(done) {
    try {
      fs.unlinkSync(path.resolve(__dirname, 'fixtures/generated.md'));
    } catch (e) {
      if (e.code != 'ENOENT') return done(err);
    }

    function generate() {
      require('fs').writeFileSync('fixtures/generated.md', '# Generated\n\n');
    }

    Docs.parse(
      {
        root: __dirname,
        init: 'node -e "(' + generate.toString() + ')()"',
        content: ['fixtures/generated.md'],
      },
      function(err, docs) {
        if (err) return done(err);
        assert.equal(docs.sections.length, 1);
        done();
      }
    );
  });

  it('should have unique anchors', function() {
    var docs = new Docs();
    var samples = [
      'Model.validatesNumericalityOf',
      'Model.validatesNumericalityOf',
      'foo',
      'foo',
      'foo',
      'foo bar',
      'foo bar',
    ];

    var expected = [
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
        var doctype = '<!DOCTYPE html>';
        assert.equal(html.substr(0, doctype.length), doctype);
        done();
      }
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
      }
    );
  });

  describe('.readConfig(options, fn)', function() {
    it('should read a config file', function(done) {
      Docs.readConfig(
        {
          configPath: 'docs.json',
          packagePath: 'package.json',
        },
        function(err, config) {
          if (err) {
            done(err);
          } else {
            assert.equal(config.assets, 'assets');
            assert.equal(config.content[0], 'README.md');
            assert.equal(config.package.name, 'strong-docs');
            done();
          }
        }
      );
    });
  });

  describe('@options', function() {
    it('should define a param of type object with properties following', function(done) {
      Docs.parse(
        {
          content: ['fixtures/js/complex-attrs.js'],
          root: __dirname,
        },
        function(err, docs) {
          done();
        }
      );
    });
  });

  describe('@descriptions', function() {
    it('should be optional', function(done) {
      Docs.parse(
        {
          content: ['fixtures/js/optional-description.js'],
          root: __dirname,
        },
        function(err, docs) {
          assert(docs.content[0].methods[0]);
          done();
        }
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
          var sections = docs.content[0].sections;
          assert.equal(sections[0].title, 'complex-headers');
          assert.equal(sections[1].title, 'link');
          assert.equal(sections[2].title, 'bold header');
          assert.equal(sections[3].title, 'code.header');
          assert.equal(sections[4].title, 'slc create');
          assert.equal(sections[5].title, 'workspace');
          done();
        }
      );
    });
  });

  describe('ngdoc flavour', function() {
    it('should include @description', function(done) {
      parseNgDocSourceFile('fixtures/js/ngdoc.js', done, function(annotation) {
        expect(annotation.html).to.contain('Some description');
      });
    });

    it('should handle multi-param function type', function(done) {
      parseNgDocSourceFile('fixtures/js/ngdoc.js', done, function(annotation) {
        // @param {String|Number}
        expect(annotation.args[0].types).to.eql(['String', 'Number']);
        // @param {function(Error|undefined, Object|undefined)}
        expect(annotation.args[1].types).to.eql([
          'function(Error|undefined, Object|undefined)',
        ]);
      });
    });

    describe('@promise', function() {
      it('should be supported', function(done) {
        parseNgDocSourceFile(
          'fixtures/js/promise-standalone.js',
          done,
          function(annotation) {
            assertPromise(annotation, ['Array'], ['Array']);
          }
        );
      });

      it('should be generated from a callback', function(done) {
        parseNgDocSourceFile('fixtures/js/promise-callback.js', done, function(
          annotation
        ) {
          assertPromise(annotation, ['Array'], ['Object']);
        });
      });

      it('should be generated from a custom description', function(done) {
        parseNgDocSourceFile('fixtures/js/promise-custom.js', done, function(
          annotation
        ) {
          assertPromise(annotation, ['Array'], ['String']);
        });
      });

      it('should include a warning when unresolvable', function(done) {
        parseNgDocSourceFile(
          'fixtures/js/promise-unresolvable.js',
          done,
          function(annotation) {
            expect(annotation.promise.warning).to.not.be.undefined;
            expect(annotation.promise.warning).to.contain(
              'Promise cannot be resolved in'
            );
          }
        );
      });
    });
  });
});

function parseNgDocSourceFile(file, done, assertion) {
  Docs.parse(
    {
      content: [file],
      root: __dirname,
    },
    function(err, docs) {
      if (err) return done(err);
      var annotation = docs.content[0].sections[0].annotation;
      done(assertion(annotation));
    }
  );
}

function assertPromise(annotation, paramType, resolveType) {
  expect(annotation.promise).to.not.be.undefined;
  expect(annotation.promise.warning).to.be.undefined;
  expect(annotation.promise.types).to.eql(paramType);
  expect(annotation.promise.attrs[0]).to.have.property.name;
  expect(annotation.promise.attrs[0].name).to.equal('resolve');
  expect(annotation.promise.attrs[0].types).to.eql(resolveType);
}
