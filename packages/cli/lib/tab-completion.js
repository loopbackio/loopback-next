// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const debug = require('./debug')();
const tabtab = require('tabtab');

const tabCompletionCommands = [
  'install-completion',
  'uninstall-completion',
  'completion',
];

/**
 * Get all available commands or options depends on entered input
 * @param optionsAndArgs - object of available options and arguments
 * - name - generator name
 * - options - list of option objects
 * - arguments - list of argument objects
 * @param partial - completion env.partial
 */
function generateCompletions(optionsAndArgs, partial) {
  // Remove the `base`
  delete optionsAndArgs.base;
  const commands = Object.keys(optionsAndArgs);
  const enteredCommand = commands.find(command => partial.includes(command));

  if (!enteredCommand) {
    return commands;
  }

  const options = optionsAndArgs[enteredCommand].options;
  const optionNames = Object.keys(options).map(opt => `--${opt}`);

  const enteredOptions = optionNames.filter(opt => partial.includes(opt));

  if (!enteredOptions.length) {
    return optionNames;
  }

  return optionNames.filter(opt => !enteredOptions.includes(opt));
}

/**
 * Process bash-completion and take care about logging available commands
 * and options
 * @param optionsAndArgs - object of available options and arguments
 * - name - generator name
 * - options - list of option objects
 * - arguments - list of argument objects
 * @param env - completion environment object
 * - complete    A Boolean indicating whether we act in "plumbing mode" or not
 * - words       The Number of words in the completed line
 * - point       A Number indicating cursor position
 * - line        The String input line
 * - partial     The String part of line preceding cursor position
 * - last        The last String word of the line
 * - lastPartial The last word String of partial
 * - prev        The String word preceding last
 */
function completion(optionsAndArgs, env) {
  if (!env.complete) {
    return;
  }

  return tabtab.log(generateCompletions(optionsAndArgs, env.partial));
}

/**
 * Register tabtab completion script
 * Will be written in bashrc or zshrc or fish configs
 */
async function installTabCompletionScript() {
  try {
    await tabtab.install({
      name: 'lb4',
      completer: 'lb4',
    });
  } catch (error) /* istanbul ignore next */ {
    debug('tab completion install script');
    throw error;
  }
}

/**
 * Remove tabtab completion script
 * Will be removed from bashrc or zshrc or fish configs
 */
async function uninstallTabCompletionScript() {
  try {
    await tabtab.uninstall({
      name: 'lb4',
    });
  } catch (error) /* istanbul ignore next */ {
    debug('tab completion uninstall script');
    throw error;
  }
}

/**
 * Run corresponding tab-completion command
 * @param optionsAndArgs - object of available options and arguments
 * - name - generator name
 * - options - list of option objects
 * - arguments - list of argument objects
 * @param originalCommand - command name
 * @param log - Log function
 */
function runTabCompletionCommand(optionsAndArgs, originalCommand, log) {
  if (originalCommand === 'install-completion') {
    return installTabCompletionScript().catch(log);
  }

  if (originalCommand === 'uninstall-completion') {
    return uninstallTabCompletionScript().catch(log);
  }

  return completion(optionsAndArgs, tabtab.parseEnv(process.env));
}

exports.tabCompletionCommands = tabCompletionCommands;
exports.runTabCompletionCommand = runTabCompletionCommand;

exports.generateCompletions = generateCompletions;
