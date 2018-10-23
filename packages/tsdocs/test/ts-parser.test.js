// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const expect = require('chai').expect;
const TSParser = require('..').TSParser;

describe('TypeScript Parser Test', function() {
  this.timeout(30000);
  const tsconfig = path.join(__dirname, 'tsconfig.json');
  const tsconfig_es2016 = path.join(__dirname, 'tsconfig.es2016.json');

  it('should parse TS file', function() {
    const file = path.join(__dirname, 'fixtures/ts/Greeter.ts');
    const tsFiles = [file];
    const tsParser = new TSParser(tsFiles, {
      excludeNotExported: false,
      tsconfig,
    });
    const parsedData = tsParser.parse();
    expect(parsedData.sections).to.have.length(11);
    expect(parsedData.constructs).to.have.length(3);
    expect(
      parsedData.constructs.map(function(c) {
        return c.node.name;
      }),
    ).to.eql(['param', 'Greeter', 'PathParameterValues']);
    expect(parsedData.errors).to.have.length(0);
    const greeterClass = parsedData.constructs.filter(function(c) {
      return c.node.name === 'Greeter';
    })[0].node;
    expect(greeterClass.children).have.length(6);
    expect(
      greeterClass.children.map(function(c) {
        return c.anchorId;
      }),
    ).to.eql([
      'Greeter.constructor',
      'Greeter.prototype.greeting',
      'Greeter.prototype.greeting2',
      'Greeter.defaultPrefix',
      'Greeter.prototype.greet',
      'Greeter.buildMessage',
    ]);
    // Two overloaded signatures
    expect(greeterClass.children[4].signatures).have.length(2);
  });

  it.skip(
    'should exclude constructs that are not exported' +
      ' (https://github.com/TypeStrong/typedoc/pull/694)',
    function() {
      const file = path.join(__dirname, 'fixtures/ts/Greeter.ts');
      const tsFiles = [file];
      const tsParser = new TSParser(tsFiles, {
        excludeNotExported: true,
        tsconfig,
      });
      const parsedData = tsParser.parse();
      expect(parsedData.sections).to.have.length(3);
      expect(parsedData.constructs).to.have.length(1);
      expect(parsedData.errors).to.have.length(0);
    },
  );

  it('should report errors if es2016 apis are used with es2015 tsconfig', function() {
    const file = path.join(__dirname, 'fixtures/ts/Greeter.es2016.ts');
    const tsFiles = [file];
    const tsParser = new TSParser(tsFiles, {
      excludeNotExported: false,
      tsconfig,
    });
    const parsedData = tsParser.parse();
    expect(parsedData.errors).to.have.length(1);
    expect(parsedData.errors[0].messageText).to.eql(
      "Property 'includes' does not exist on type 'string[]'.",
    );
  });

  it('should allow Array.includes() with es2016 tsconfig', function() {
    const file = path.join(__dirname, 'fixtures/ts/Greeter.es2016.ts');
    const tsFiles = [file];
    const tsParser = new TSParser(tsFiles, {
      tsconfig: tsconfig_es2016,
      excludeNotExported: false,
    });
    const parsedData = tsParser.parse();
    expect(parsedData.sections).to.have.length(3);
    expect(parsedData.constructs).to.have.length(1);
    expect(parsedData.errors).to.have.length(0);
  });

  it('should allow Array.includes() with tstarget="es2016"', function() {
    const file = path.join(__dirname, 'fixtures/ts/Greeter.es2016.ts');
    const tsFiles = [file];
    const tsParser = new TSParser(tsFiles, {
      target: 'es2016',
      excludeNotExported: false,
    });
    const parsedData = tsParser.parse();
    expect(parsedData.sections).to.have.length(3);
    expect(parsedData.constructs).to.have.length(1);
    expect(parsedData.errors).to.have.length(0);
  });
});
