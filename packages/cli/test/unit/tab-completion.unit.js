// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {expect, sinon} = require('@loopback/testlab');
const tabtab = require('tabtab');
const {
  generateCompletions,
  runTabCompletionCommand,
} = require('../../lib/tab-completion');

const optionsAndArgs = {
  base: {
    options: {},
  },
  app: {
    options: {},
  },
  model: {
    options: {
      table: {
        name: 'table',
      },
      base: {
        name: 'base',
      },
    },
  },
};

describe('tab-completion unit tests', () => {
  describe('runTabCompletionCommand', () => {
    let logStub;
    let parseEnvStub;

    before(() => {
      logStub = sinon.stub(tabtab, 'log');
      parseEnvStub = sinon.stub(tabtab, 'parseEnv');
    });

    it('should run tabtab.install if install-completion argument passed', () => {
      const installStub = sinon.stub(tabtab, 'install');

      runTabCompletionCommand(optionsAndArgs, 'install-completion');

      sinon.assert.calledWith(installStub, {
        name: 'lb4',
        completer: 'lb4',
      });
    });

    it('should run tabtab.uninstall if uninstall-completion argument passed', () => {
      const uninstallStub = sinon.stub(tabtab, 'uninstall');

      runTabCompletionCommand(optionsAndArgs, 'uninstall-completion');

      sinon.assert.calledWith(uninstallStub, {
        name: 'lb4',
      });
    });

    it("shouldn't run tabtab.log if completion argument passed and parseEnv returns complete=false", () => {
      parseEnvStub.returns({
        complete: false,
      });

      runTabCompletionCommand(optionsAndArgs, 'completion');

      sinon.assert.notCalled(logStub);
    });

    it('should run tabtab.log if completion argument passed', () => {
      parseEnvStub.returns({
        partial: '',
        complete: true,
      });

      runTabCompletionCommand(optionsAndArgs, 'completion');

      sinon.assert.calledWith(logStub, ['app', 'model']);
    });
  });

  describe('generateCompletions', () => {
    describe('should return available generator commands', () => {
      testExpect('if only lb4 word is passed', 'lb4', ['app', 'model']);
    });

    describe('should return available command options', () => {
      testExpect('if only command word is passed', 'lb4 model', [
        '--table',
        '--base',
      ]);
      testExpect(
        'if some options have already passed',
        'lb4 model --table=MyTable',
        ['--base'],
      );
      testExpect(
        'if all possible options have already passed',
        'lb4 model --table=MyTable --base=Entity',
        [],
      );
    });

    function testExpect(testName, input, expected) {
      it(testName, () => {
        expect(generateCompletions(optionsAndArgs, input)).to.deepEqual(
          expected,
        );
      });
    }
  });
});
