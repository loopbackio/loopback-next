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
import minimist, {ParsedArgs} from 'minimist';
import yeoman from 'yeoman-environment';
import {printVersions} from './cli-package';
import {getDebug} from './debug';
import {CLI_KEY} from './keys';
import {
  GeneratorMetadata,
  GENERATORS,
  LOOPBACK_PREFIX,
  RunOptions,
} from './types';

/**
 * Cli class serving as an extension point for generators
 */
@extensionPoint(GENERATORS, {
  tags: {[ContextTags.KEY]: CLI_KEY},
  scope: BindingScope.SINGLETON,
})
export class Cli {
  readonly env: yeoman.Options;
  /**
   *
   * @param getGenerators - A getter function to discover all generator
   * extensions
   */
  constructor(
    @extensions() private getGenerators: Getter<GeneratorMetadata[]>,
  ) {
    this.env = yeoman.createEnv();
  }

  protected getNamespaceForGenerator(name: string) {
    return `${LOOPBACK_PREFIX}${name}`;
  }

  /**
   * Set up yeoman generators
   */
  async setupGenerators() {
    const debugFn = getDebug('register');
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
    const debugFn = getDebug();
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

export class CliApplication extends Application {
  cli: Cli;

  get env() {
    return this.cli?.env;
  }

  constructor() {
    super({name: 'cli', shutdown: {signals: []}});
    this.add(createBindingFromClass(Cli));
  }

  async start() {
    await super.start();
    this.cli = await this.get(CLI_KEY);
    await this.cli.setupGenerators();
  }

  async run(parsedArgs: ParsedArgs, options?: RunOptions) {
    options = {dryRun: false, log: console.log, ...options};
    if (parsedArgs.version) {
      printVersions(options.log);
      return;
    }

    // list generators
    if (parsedArgs.commands) {
      this.cli.printCommands(options.log);
      return;
    }

    await this.cli.runCommand(parsedArgs, options);
  }

  static parseArgs(...cliArgs: string[]): ParsedArgs {
    if (cliArgs.length === 0) {
      cliArgs = process.argv.slice(2);
    }
    const args = minimist(cliArgs, {
      alias: {
        version: 'v', // --version or -v: print versions
        commands: 'l', // --commands or -l: print commands
        help: 'h', // --help or -l: print help
      },
    });
    return args;
  }
}

/**
 * Main function to run CLI with minimist parsed args
 * @param parsedArgs - Parsed args by minimist
 * @param options - Options for the run
 */
export async function main(...cliArgs: string[]) {
  const app = new CliApplication();
  await app.start();
  const parsedArgs = CliApplication.parseArgs(...cliArgs);
  await app.run(parsedArgs, {dryRun: parsedArgs['dry-run']});
  return app;
}
