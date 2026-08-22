// Copyright IBM Corp. and LoopBack contributors 2019,2026. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {expect, sinon} = require('@loopback/testlab');
const {printVersions, cliPkg} = require('../../lib/version-helper');

describe('version-helper unit tests', () => {
  let logStub;

  beforeEach(() => {
    logStub = sinon.stub();
  });

  describe('printVersions', () => {
    it('prints CLI version', () => {
      printVersions(logStub);
      sinon.assert.calledWith(
        logStub,
        '@loopback/cli version: %s',
        cliPkg.version,
      );
    });

    it('prints @loopback/* dependencies', () => {
      printVersions(logStub);
      sinon.assert.calledWith(logStub, '\n@loopback/* dependencies:');
    });

    it('uses console.log as default logger', () => {
      const consoleStub = sinon.stub(console, 'log');
      printVersions();
      sinon.assert.called(consoleStub);
      consoleStub.restore();
    });

    it('prints template dependencies', () => {
      printVersions(logStub);
      const templateDeps = cliPkg.config.templateDependencies;
      for (const dep in templateDeps) {
        if (dep.startsWith('@loopback/') && dep !== '@loopback/cli') {
          sinon.assert.calledWith(
            logStub,
            '  - %s: %s',
            dep,
            templateDeps[dep],
          );
        }
      }
    });

    it('does not print non-loopback dependencies', () => {
      printVersions(logStub);
      const calls = logStub.getCalls();
      const nonLoopbackCalls = calls.filter(call => {
        const args = call.args;
        return (
          args.length > 1 &&
          typeof args[1] === 'string' &&
          !args[1].startsWith('@loopback/')
        );
      });
      expect(nonLoopbackCalls.length).to.equal(0);
    });

    it('does not print @loopback/cli in dependencies list', () => {
      printVersions(logStub);
      const calls = logStub.getCalls();
      const cliCalls = calls.filter(call => {
        const args = call.args;
        return args.length > 1 && args[1] === '@loopback/cli';
      });
      expect(cliCalls.length).to.equal(0);
    });
  });

  describe('cliPkg', () => {
    it('exports package.json data', () => {
      expect(cliPkg).to.be.an.Object();
      expect(cliPkg).to.have.property('name', '@loopback/cli');
      expect(cliPkg).to.have.property('version');
    });

    it('has config with templateDependencies', () => {
      expect(cliPkg.config).to.be.an.Object();
      expect(cliPkg.config.templateDependencies).to.be.an.Object();
    });

    it('templateDependencies includes @loopback packages', () => {
      const deps = cliPkg.config.templateDependencies;
      const loopbackDeps = Object.keys(deps).filter(d =>
        d.startsWith('@loopback/'),
      );
      expect(loopbackDeps.length).to.be.greaterThan(0);
    });
  });
});

// Made with Bob
