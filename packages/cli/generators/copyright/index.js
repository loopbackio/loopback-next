// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const BaseGenerator = require('../../lib/base-generator');
const {updateFileHeaders} = require('./header');
const {spdxLicenseList, updateLicense} = require('./license');
const g = require('../../lib/globalize');
const _ = require('lodash');
const chalk = require('chalk');
const autocomplete = require('inquirer-autocomplete-prompt');

module.exports = class CopyrightGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    this.licenseList = [];
    for (const id in spdxLicenseList) {
      const license = spdxLicenseList[id];
      if (
        ['mit', 'apache-2.0', 'isc', 'artistic-2.0', 'custom'].includes(
          id.toLocaleLowerCase(),
        )
      ) {
        // Add well-known licenses in front of the list
        this.licenseList.unshift(license);
      } else {
        this.licenseList.push(license);
      }
    }
    this.licenseList = this.licenseList.map(lic => ({
      value: lic,
      name: `${lic.id} (${lic.name})`,
    }));
  }

  initializing() {
    // Register `autocomplete` plugin
    this.env.adapter.promptModule.registerPrompt('autocomplete', autocomplete);
  }

  _setupGenerator() {
    this.option('owner', {
      type: String,
      required: false,
      description: g.f('Copyright owner'),
    });
    this.option('license', {
      type: String,
      required: false,
      description: g.f('License'),
    });
    this.option('updateLicense', {
      type: Boolean,
      required: false,
      description: g.f('Update license in package.json and LICENSE'),
    });
    this.option('gitOnly', {
      type: Boolean,
      required: false,
      default: true,
      description: g.f('Only update git tracked files'),
    });
    this.option('exclude', {
      type: String,
      required: false,
      default: '',
      description: g.f('Exclude files that match the pattern'),
    });
  }

  setOptions() {
    return super.setOptions();
  }

  async promptOwnerAndLicense() {
    const pkgFile = this.destinationPath('package.json');
    const pkg = this.fs.readJSON(this.destinationPath('package.json'));
    if (pkg == null) {
      this.exit(`${pkgFile} does not exist.`);
      return;
    }
    this.packageJson = pkg;
    let author = _.get(pkg, 'author');
    if (typeof author === 'object') {
      author = author.name;
    }
    const owner =
      this.options.copyrightOwner || _.get(pkg, 'copyright.owner', author);
    let license = this.options.license || _.get(pkg, 'license');
    const licenses = [...this.licenseList];
    if (license != null) {
      // find the matching license by id and move it to the front of the list
      for (let i = 0; i < licenses.length; i++) {
        if (licenses[i].value.id.toLowerCase() === license.toLowerCase()) {
          const lic = licenses.splice(i, 1);
          licenses.unshift(...lic);
          break;
        }
      }
    }

    let answers = await this.prompt([
      {
        type: 'input',
        name: 'owner',
        message: g.f('Copyright owner:'),
        default: owner,
        when: this.options.owner == null,
      },
      {
        type: 'autocomplete',
        name: 'license',
        // choices: licenseList,
        source: async (_answers, input) => {
          if (input == null) return licenses;
          const matched = licenses.filter(lic => {
            const a = input.toLowerCase();
            return (
              lic.value.id.toLowerCase().startsWith(a) ||
              lic.value.name.toLowerCase().startsWith(a)
            );
          });
          return matched;
        },
        pageSize: 10,
        message: g.f('License name:'),
        default: license,
        when: this.options.license == null,
      },
    ]);
    answers = answers || {};
    const exclude = this.options.exclude || '';
    const excludePatterns = exclude.split(',').filter(p => p !== '');
    excludePatterns.push('**/node_modules/**/*');

    const copyrightOwner = answers.owner || this.options.owner;
    license = answers.license || this.options.license;

    let customLicenseLines = [];
    if (
      (license && license.id === 'CUSTOM') ||
      license === 'custom' ||
      license === 'CUSTOM'
    ) {
      const templateFile = this.destinationPath('license-header.template');
      if (this.fs.exists(templateFile)) {
        const template = this.fs.read(templateFile);
        customLicenseLines = template.match(/[^\r\n]+/g);
        this.log(template);
      } else {
        this.log(
          g.f(
            'Please provide lines of text for the custom copyright/license headers.',
          ),
        );
        const example = ` Copyright <%= owner %> <%= years %>. All Rights Reserved.
 Node module: <%= name %>',
 This file is licensed under the <%= license %>.
 License text available at <%= url %>`;
        this.log(
          chalk.green(
            `Example (supported variables: owner/years/name):
${example}`,
          ),
        );

        answers = await this.prompt([
          {
            type: 'editor',
            name: 'customLicenseLines',
            message: g.f('Custom license lines:'),
            default: example,
            when: customLicenseLines.length === 0,
          },
        ]);
      }
    }

    answers = answers || {};
    if (answers.customLicenseLines) {
      customLicenseLines = answers.customLicenseLines;
      this.log(customLicenseLines);
      customLicenseLines = customLicenseLines.match(/[^\r\n]+/g);
    }

    this.headerOptions = {
      copyrightOwner,
      customLicenseLines,
      license,
      log: this.log,
      gitOnly: this.options.gitOnly,
      fs: this.fs,
      excludePatterns,
    };
  }

  async updateLicense() {
    if (this.shouldExit()) return;
    const answers = await this.prompt([
      {
        type: 'confirm',
        name: 'updateLicense',
        message: g.f('Do you want to update package.json and LICENSE?'),
        default: false,
        when: this.options.updateLicense == null,
      },
    ]);
    const updateLicenseFile =
      (answers && answers.updateLicense) || this.options.updateLicense;
    if (!updateLicenseFile) return;
    this.headerOptions.updateLicense = updateLicenseFile;
    await updateLicense(
      this.destinationRoot(),
      this.packageJson,
      this.headerOptions,
    );
  }

  async updateHeaders() {
    if (this.shouldExit()) return;
    await updateFileHeaders(this.destinationRoot(), this.headerOptions);
  }

  async end() {
    await super.end();
  }
};
