// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const BaseGenerator = require('../../lib/base-generator');
const {debug, debugJson} = require('./utils');
const {loadAndBuildSpec} = require('./spec-loader');
const {validateUrlOrFile, escapeComment} = require('./utils');
const {getControllerFileName} = require('./spec-helper');

const updateIndex = require('../../lib/update-index');
const MODEL = 'models';
const CONTROLLER = 'controllers';

module.exports = class OpenApiGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.argument('url', {
      description: 'URL or file path of the OpenAPI spec',
      required: false,
      type: String,
    });

    this.option('url', {
      description: 'URL or file path of the OpenAPI spec',
      required: false,
      type: String,
    });

    this.option('validate', {
      description: 'Validate the OpenAPI spec',
      required: false,
      default: false,
      type: Boolean,
    });

    this.option('promote-anonymous-schemas', {
      description: 'Promote anonymous schemas as models',
      required: false,
      default: false,
      type: Boolean,
    });

    return super._setupGenerator();
  }

  checkLoopBackProject() {
    return super.checkLoopBackProject();
  }

  async askForSpecUrlOrPath() {
    if (this.shouldExit()) return;
    const prompts = [
      {
        name: 'url',
        message: 'Enter the OpenAPI spec url or file path:',
        default: this.options.url,
        validate: validateUrlOrFile,
        when: this.options.url == null,
      },
    ];
    const answers = await this.prompt(prompts);
    if (answers.url) {
      this.url = answers.url.trim();
    } else {
      this.url = this.options.url;
    }
  }

  async loadAndBuildApiSpec() {
    if (this.shouldExit()) return;
    try {
      const result = await loadAndBuildSpec(this.url, {
        log: this.log,
        validate: this.options.validate,
        promoteAnonymousSchemas: this.options['promote-anonymous-schemas'],
      });
      debugJson('OpenAPI spec', result.apiSpec);
      Object.assign(this, result);
    } catch (e) {
      this.exit(e);
    }
  }

  async selectControllers() {
    if (this.shouldExit()) return;
    const choices = this.controllerSpecs.map(c => {
      return {
        name: c.tag ? `[${c.tag}] ${c.className}` : c.className,
        value: c.className,
        checked: true,
      };
    });
    const prompts = [
      {
        name: 'controllerSelections',
        message: 'Select controllers to be generated:',
        type: 'checkbox',
        choices: choices,
        // Require at least one item to be selected
        // This prevents users from accidentally pressing ENTER instead of SPACE
        // to select an item from the list
        validate: result => !!result.length,
      },
    ];
    const selections =
      (await this.prompt(prompts)).controllerSelections ||
      choices.map(c => c.value);
    this.selectedControllers = this.controllerSpecs.filter(c =>
      selections.some(a => a === c.className),
    );
    this.selectedControllers.forEach(
      c => (c.fileName = getControllerFileName(c.tag || c.className)),
    );
  }

  async scaffold() {
    if (this.shouldExit()) return false;
    this._generateModels();
    await this._updateIndex(MODEL);
    this._generateControllers();
    await this._updateIndex(CONTROLLER);
  }

  _generateControllers() {
    const source = this.templatePath(
      'src/controllers/controller-template.ts.ejs',
    );
    for (const c of this.selectedControllers) {
      const controllerFile = c.fileName;
      if (debug.enabled) {
        debug(`Artifact output filename set to: ${controllerFile}`);
      }
      const dest = this.destinationPath(`src/controllers/${controllerFile}`);
      if (debug.enabled) {
        debug('Copying artifact to: %s', dest);
      }
      this.copyTemplatedFiles(source, dest, mixinEscapeComment(c));
    }
  }

  _generateModels() {
    const modelSource = this.templatePath('src/models/model-template.ts.ejs');
    const typeSource = this.templatePath('src/models/type-template.ts.ejs');
    for (const m of this.modelSpecs) {
      if (!m.fileName) continue;
      const modelFile = m.fileName;
      if (debug.enabled) {
        debug(`Artifact output filename set to: ${modelFile}`);
      }
      const dest = this.destinationPath(`src/models/${modelFile}`);
      if (debug.enabled) {
        debug('Copying artifact to: %s', dest);
      }
      const source = m.kind === 'class' ? modelSource : typeSource;
      this.copyTemplatedFiles(source, dest, mixinEscapeComment(m));
    }
  }

  // update index file for models and controllers
  async _updateIndex(dir) {
    if (dir === MODEL) {
      const targetDir = this.destinationPath(`src/${MODEL}`);
      for (const m of this.modelSpecs) {
        // Check all files being generated to ensure they succeeded
        const status = this.conflicter.generationStatus[m.fileName];
        if (status !== 'skip' && status !== 'identical') {
          await updateIndex(targetDir, m.fileName);
        }
      }
    }
    if (dir === CONTROLLER) {
      const targetDir = this.destinationPath(`src/${CONTROLLER}`);
      for (const c of this.selectedControllers) {
        // Check all files being generated to ensure they succeeded
        const status = this.conflicter.generationStatus[c.fileName];
        if (status !== 'skip' && status !== 'identical') {
          await updateIndex(targetDir, c.fileName);
        }
      }
    }
  }

  async end() {
    await super.end();
    if (this.shouldExit()) return;
  }
};

function mixinEscapeComment(context) {
  return Object.assign(context, {escapeComment});
}
