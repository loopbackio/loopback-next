// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingScope,
  ContextTags,
  createBindingFromClass,
  extensionPoint,
  extensions,
  Getter,
} from '@loopback/core';
import camelCaseKeys from 'camelcase-keys';
import {ParsedArgs} from 'minimist';
import yeoman from 'yeoman-environment';
import {debug} from './debug';
import {CLI_KEY} from './keys';
import {
  GeneratorMetadata,
  GENERATORS,
  LOOPBACK_PREFIX,
  RunOptions,
} from './types';
import {printVersions} from './version-helper';

/**
 * Cli class serving as an extension point for generators
 */
@extensionPoint(GENERATORS, {
  tags: {[ContextTags.KEY]: CLI_KEY},
  scope: BindingScope.SINGLETON,
})
export class Cli {
  protected env: yeoman.Options;
  /**
   *
   * @param getGenerators - A getter function to discover all generator
   * extensions
   */
  constructor(
    @extensions() private getGenerators: Getter<GeneratorMetadata[]>,
  ) {}

  protected getNamespaceForGenerator(name: string) {
    return `${LOOPBACK_PREFIX}${name}`;
  }

  /**
   * Set up yeoman generators
   */
  async setupGenerators() {
    const debugFn = debug('register');
    this.env = yeoman.createEnv();
    const generators = await this.getGenerators();
    for (const generator of generators) {
      debugFn('Registering generator %s (%s)', generator.path, generator.name);
      const namespace = this.getNamespaceForGenerator(generator.name);
      if (typeof generator.ctor === 'function') {
        this.env.registerStub(generator.ctor, namespace, generator.path);
      } else {
        this.env.register(generator.path, namespace);
      }
    }
    return this.env;
  }

  /**
   * Parse arguments and run corresponding command
   * @param parsedArgs - Command options
   * @param log - Log function
   */
  async runCommand(parsedArgs: ParsedArgs, options?: RunOptions) {
    options = {dryRun: false, log: console.log, ...options};
    const args = parsedArgs._;
    const originalCommand: string = args.shift()!;
    let command = LOOPBACK_PREFIX + (originalCommand ?? 'app');
    const supportedCommands = this.env.getGeneratorsMeta();
    if (!(command in supportedCommands)) {
      command = LOOPBACK_PREFIX + 'app';
      args.unshift(originalCommand);
      args.unshift(command);
    } else {
      args.unshift(command);
    }
    const debugFn = debug();
    debugFn('invoking generator', args);
    // `yo` is adding flags converted to CamelCase
    const yoArgs = camelCaseKeys(parsedArgs, {
      exclude: ['--', /^\w$/, 'argv'],
    });
    Object.assign(yoArgs, parsedArgs);
    debugFn('env.run %j %j', args, options);

    if (!options.dryRun) {
      await this.env.run(args, options);
    }

    // list generators
    if (parsedArgs.help && !originalCommand) {
      this.printCommands(options.log);
    }
  }

  /**
   * Print a list of available commands
   * @param log - Log function
   */
  printCommands(log = console.log) {
    log('Available commands:');
    const list = Object.keys(this.env.getGeneratorsMeta())
      .filter(name => /^loopback4:/.test(name))
      .map(name => name.replace(/^loopback4:/, '  lb4 '));
    log(list.join('\n'));
  }
}

/**
 * Main function to run CLI with minimist parsed args
 * @param parsedArgs - Parsed args by minimist
 * @param options - Options for the run
 */
export async function main(parsedArgs: ParsedArgs, options?: RunOptions) {
  options = {dryRun: false, log: console.log, ...options};
  if (parsedArgs.version) {
    printVersions(options.log);
    return;
  }

  const app = new Application();
  app.add(createBindingFromClass(Cli));
  const cli = await app.get(CLI_KEY);
  await cli.setupGenerators();

  // list generators
  if (parsedArgs.commands) {
    cli.printCommands(options.log);
    return;
  }

  await cli.runCommand(parsedArgs, options);
}
