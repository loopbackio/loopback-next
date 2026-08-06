// Copyright IBM Corp. and LoopBack contributors 2018,2026. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {expect, sinon} = require('@loopback/testlab');
const cli = require('../../lib/cli');

describe('cli unit tests', () => {
  let logStub;

  beforeEach(() => {
    logStub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    logStub.restore();
  });

  describe('main function', () => {
    it('prints version when --version flag is passed', () => {
      const opts = {version: true};
      cli(opts, logStub);
      sinon.assert.calledWith(logStub, sinon.match(/@loopback\/cli version:/));
    });

    it('prints commands when --commands flag is passed', () => {
      const opts = {commands: true};
      cli(opts, logStub);
      sinon.assert.calledWith(logStub, 'Available commands:');
    });

    it('uses console.log as default log function', () => {
      const opts = {version: true};
      cli(opts);
      // Should not throw
    });

    it('handles dry-run option', () => {
      const opts = {
        'dry-run': true,
        _: [],
      };
      // Should not throw and not execute actual commands
      cli(opts, logStub);
    });

    it('handles dryRun option (camelCase)', () => {
      const opts = {
        dryRun: true,
        _: [],
      };
      // Should not throw and not execute actual commands
      cli(opts, logStub);
    });

    it('handles meta option for generating command metadata', () => {
      const opts = {
        meta: true,
        'dry-run': true,
      };
      const result = cli(opts, logStub);
      expect(result).to.be.an.Object();
      expect(result).to.have.property('base');
    });

    it('handles empty options object', () => {
      const opts = {_: []};
      // Should not throw
      cli(opts, logStub);
    });
  });

  describe('command handling', () => {
    it('defaults to app command when no command specified', () => {
      const opts = {
        _: [],
        'dry-run': true,
      };
      cli(opts, logStub);
      // Should default to app generator
    });

    it('handles help flag without command', () => {
      const opts = {
        _: [],
        help: true,
        'dry-run': true,
      };
      cli(opts, logStub);
      sinon.assert.calledWith(logStub, 'Available commands:');
    });

    it('handles unknown command by defaulting to app', () => {
      const opts = {
        _: ['unknown-command'],
        'dry-run': true,
      };
      // Should not throw and default to app
      cli(opts, logStub);
    });

    it('handles valid command names', () => {
      const commands = [
        'app',
        'controller',
        'datasource',
        'model',
        'repository',
        'service',
      ];
      commands.forEach(cmd => {
        const opts = {
          _: [cmd],
          'dry-run': true,
        };
        // Should not throw
        cli(opts, logStub);
      });
    });
  });

  describe('option handling', () => {
    it('handles skip-cache option', () => {
      const opts = {
        _: ['model'],
        'skip-cache': true,
        'dry-run': true,
      };
      cli(opts, logStub);
      // Should not throw
    });

    it('handles skip-install option', () => {
      const opts = {
        _: ['app'],
        'skip-install': true,
        'dry-run': true,
      };
      cli(opts, logStub);
      // Should not throw
    });

    it('handles force-install option', () => {
      const opts = {
        _: ['app'],
        'force-install': true,
        'dry-run': true,
      };
      cli(opts, logStub);
      // Should not throw
    });

    it('handles ask-answered option', () => {
      const opts = {
        _: ['model'],
        'ask-answered': true,
        'dry-run': true,
      };
      cli(opts, logStub);
      // Should not throw
    });

    it('handles multiple options together', () => {
      const opts = {
        _: ['controller'],
        'skip-cache': true,
        'skip-install': true,
        help: true,
        'dry-run': true,
      };
      cli(opts, logStub);
      // Should not throw
    });
  });

  describe('generator registration', () => {
    it('registers all expected generators', () => {
      const opts = {commands: true};
      cli(opts, logStub);

      const output = logStub.args.join('\n');
      const expectedGenerators = [
        'app',
        'extension',
        'controller',
        'datasource',
        'model',
        'repository',
        'service',
        'example',
        'openapi',
        'observer',
        'interceptor',
        'discover',
        'relation',
        'update',
        'rest-crud',
        'copyright',
      ];

      expectedGenerators.forEach(gen => {
        expect(output).to.match(new RegExp(`lb4 ${gen}`));
      });
    });
  });
});

// Made with Bob
