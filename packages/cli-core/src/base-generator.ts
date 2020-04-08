// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

import {JSONObject} from '@loopback/core';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Generator, {Answers, Question} from 'yeoman-generator';
import {debug as _debug} from './debug';
import {g} from './globalize';
import {getDefaultAnswer, isQuestionOptional} from './inquirer';
import {LoopBackGenerator} from './types';
import {updateIndex} from './update-index';
import {readTextFromStdin, StatusConflicter} from './utils';
import {checkLoopBackProject} from './version-helper';

const debug = _debug('base-generator');

debug('Is stdin interactive (isTTY)?', process.stdin.isTTY);

/**
 * Base Generator for LoopBack 4
 */
export class BaseGenerator extends Generator implements LoopBackGenerator {
  protected conflicter: StatusConflicter;
  protected exitGeneration: boolean | string | Error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected artifactInfo: Record<string, any>;
  packageJson: JSONObject;

  // Note: arguments and options should be defined in the constructor.
  constructor(args: string | string[], opts: object) {
    super(args, opts);
    debug('Initializing generator', this.constructor.name);
    this.conflicter = new StatusConflicter(
      this.env.adapter,
      this.options.force,
    );
    this._setupGenerator();
  }

  /**
   * Subclasses can extend _setupGenerator() to set up the generator
   */
  _setupGenerator() {
    debug('Setting up generator', this.constructor.name);
    this.option('config', {
      type: String,
      alias: 'c',
      description: g.f('JSON file name or value to configure options'),
    });

    this.option('yes', {
      type: Boolean,
      alias: 'y',
      description: g.f(
        'Skip all confirmation prompts with default or provided value',
      ),
    });

    this.option('format', {
      type: Boolean,
      description: g.f('Format generated code using npm run lint:fix'),
    });

    this.artifactInfo = this.artifactInfo || {
      rootDir: 'src',
    };
  }

  /**
   * Read a json document from stdin
   */
  async _readJSONFromStdin() {
    debug('Reading JSON from stdin');
    if (process.stdin.isTTY) {
      this.log(
        chalk.green(
          'Please type in a json object line by line ' +
            '(Press <ctrl>-D or type EOF to end):',
        ),
      );
    }

    let jsonStr;
    try {
      jsonStr = await readTextFromStdin();
      debug(
        'Result:',
        jsonStr === undefined ? '(undefined)' : JSON.stringify(jsonStr),
      );
      return JSON.parse(jsonStr);
    } catch (e) {
      if (!process.stdin.isTTY) {
        debug(e, jsonStr);
      }
      throw e;
    }
  }

  async setOptions() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let opts: Record<string, any> = {};
    const jsonFileOrValue = this.options.config;
    debug(
      'Loading generator options from CLI args and/or stdin.',
      ...(this.options.config === undefined
        ? ['(No config was provided.)']
        : ['Config:', this.options.config]),
    );
    try {
      if (
        jsonFileOrValue === 'stdin' ||
        (!jsonFileOrValue && !process.stdin.isTTY)
      ) {
        debug('  enabling --yes and reading config from stdin');
        this.options['yes'] = true;
        opts = await this._readJSONFromStdin();
      } else if (typeof jsonFileOrValue === 'string') {
        const jsonFile = path.resolve(process.cwd(), jsonFileOrValue);
        if (fs.existsSync(jsonFile)) {
          debug('  reading config from file', jsonFile);
          opts = this.fs.readJSON(jsonFile);
        } else {
          debug('  parsing config from string', jsonFileOrValue);
          // Try parse the config as stringified json
          opts = JSON.parse(jsonFileOrValue);
        }
      }
    } catch (e) {
      this.exit(e);
      return;
    }
    if (typeof opts !== 'object') {
      this.exit('Invalid config file or value: ' + jsonFileOrValue);
      return;
    }
    for (const o in opts) {
      if (this.options[o] == null) {
        this.options[o] = opts[o];
      }
    }
  }

  /**
   * Override the base prompt to skip prompts with default answers
   * @param questions - One or more questions
   */
  async prompt<T extends Answers = Answers>(
    questions: Question<T>,
  ): Promise<T> {
    // Normalize the questions to be an array
    if (!Array.isArray(questions)) {
      questions = [questions];
    }
    if (!this.options['yes']) {
      if (!process.stdin.isTTY) {
        const msg =
          'The stdin is not a terminal. No prompt is allowed. ' +
          'Use --config to provide answers to required prompts and ' +
          '--yes to skip optional prompts with default answers';
        this.log(chalk.red(msg));
        this.exit(new Error(msg));
        return {} as T;
      }
      // Non-express mode, continue to prompt
      debug('Questions', questions);
      const answers = await super.prompt(questions);
      debug('Answers', answers);
      return answers;
    }

    const answers: T = (Object.assign({}, this.options) as unknown) as T;

    for (const q of questions as Question<T>[]) {
      let when = q.when;
      if (typeof q.when === 'function') {
        when = await q.when(answers);
      }
      if (when === false) continue;
      if (isQuestionOptional(q, this.options)) {
        const answer = await getDefaultAnswer(q, answers);
        debug('%s: %j', q.name, answer);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (answers as any)[q.name] = answer;
      } else {
        if (!process.stdin.isTTY) {
          const msg =
            'The stdin is not a terminal. No prompt is allowed. ' +
            `(While resolving a required prompt ${JSON.stringify(q.name)}.)`;
          this.log(chalk.red(msg));
          this.exit(new Error(msg));
          return answers;
        }
        // Only prompt for non-skipped questions
        const props = await super.prompt([q]);
        Object.assign(answers, props);
      }
    }
    return answers;
  }

  /**
   * Override the usage text by replacing `yo loopback4:` with `lb4 `.
   */
  usage() {
    const text = super.usage();
    return text.replace(/^yo loopback4:/g, 'lb4 ');
  }

  /**
   * Tell this generator to exit with the given reason
   * @param {string|Error} reason
   */
  exit(reason: boolean | string | Error) {
    // exit(false) should not exit
    if (reason === false) return;
    // exit(), exit(undefined), exit('') should exit
    if (!reason) reason = true;
    this.exitGeneration = reason;
  }

  /**
   * Run `npm install` in the project
   */
  install() {
    if (this.shouldExit()) return false;
    const opts = this.options.npmInstall || {};
    const spawnOpts = Object.assign({}, this.options.spawn, {
      cwd: this.destinationRoot(),
    });
    this.npmInstall(undefined, opts, spawnOpts);
  }

  /**
   * Wrapper for mem-fs-editor.copyTpl() to ensure consistent options
   *
   * See https://github.com/SBoudrias/mem-fs-editor/blob/master/lib/actions/copy-tpl.js
   *
   * @param {string} from
   * @param {string} to
   * @param {object} context
   * @param {object} templateOptions
   * @param {object} copyOptions
   */
  copyTemplatedFiles(
    from: string,
    to: string,
    context: object,
    templateOptions = {},
    copyOptions = {
      // See https://github.com/mrmlnc/fast-glob#options-1
      globOptions: {
        // Allow patterns to match filenames starting with a period (files &
        // directories), even if the pattern does not explicitly have a period
        // in that spot.
        dot: true,
        // Disable expansion of brace patterns ({a,b}, {1..3}).
        nobrace: true,
        // Disable extglob support (patterns like +(a|b)), so that extglobs
        // are regarded as literal characters. This flag allows us to support
        // Windows paths such as
        // `D:\Users\BKU\oliverkarst\AppData(Roaming)\npm\node_modules\@loopback\cli`
        noext: true,
      },
    },
  ) {
    return this.fs.copyTpl(from, to, context, templateOptions, copyOptions);
  }

  /**
   * Checks if current directory is a LoopBack project by checking for
   * "@loopback/core" package in the dependencies section of the
   * package.json.
   */
  async checkLoopBackProject() {
    debug('Checking for loopback project');
    await checkLoopBackProject(this);
  }

  _runNpmScript(projectDir: string, args: string[]) {
    return new Promise((resolve, reject) => {
      this.spawnCommand('npm', args, {
        // Disable stdout
        stdio: [process.stdin, 'ignore', process.stderr],
        cwd: projectDir,
      }).on('close', (code?: number) => {
        if (code === 0) resolve();
        else reject(new Error('npm exit code: ' + code));
      });
    });
  }

  /**
   * Check if the generator should exit
   */
  shouldExit() {
    return !!this.exitGeneration;
  }

  async _runLintFix() {
    if (this.options.format) {
      const pkg = this.packageJson || {};
      if (pkg.scripts && (pkg.scripts as JSONObject['lint:fix'])) {
        this.log(g.f("Running 'npm run lint:fix' to format the code..."));
        await this._runNpmScript(this.destinationRoot(), [
          'run',
          '-s',
          'lint:fix',
        ]);
      } else {
        this.log(
          chalk.red(g.f("No 'lint:fix' script is configured in package.json.")),
        );
      }
    }
  }

  /**
   * Print out the exit reason if this generator is told to exit before it ends
   */
  async end() {
    if (this.shouldExit()) {
      debug(this.exitGeneration);
      this.log(
        chalk.red(g.f('Generation is aborted: %s', this.exitGeneration)),
      );
      // Fail the process
      process.exitCode = 1;
      return;
    }
    await this._runLintFix();
  }

  // Check all files being generated to ensure they succeeded
  _isGenerationSuccessful() {
    const generationStatus = !!Object.entries(
      this.conflicter.generationStatus,
    ).find(([key, val]) => {
      // If a file was modified, update the indexes and say stuff about it
      return val !== 'skip' && val !== 'identical';
    });
    debug(`Generation status: ${generationStatus}`);
    return generationStatus;
  }

  async _updateIndexFile(dir: string, file: string) {
    await updateIndex(dir, file);

    // Output for users
    const updateDirRelPath = path.relative(
      this.artifactInfo.relPath,
      this.artifactInfo.outDir,
    );

    const outPath = path.join(
      this.artifactInfo.relPath,
      updateDirRelPath,
      'index.ts',
    );

    this.log(chalk.green('   update'), `${outPath}`);
  }
}
