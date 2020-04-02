// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const BaseGenerator = require('../../lib/base-generator');
const {updateFileHeaders, spdxLicenseList} = require('./header');
const g = require('../../lib/globalize');
const _ = require('lodash');
const autocomplete = require('inquirer-autocomplete-prompt');

module.exports = class CopyrightGenerator extends BaseGenerator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    this.licenseList = [];
    for (const id in spdxLicenseList) {
      const license = spdxLicenseList[id];
      if (
        ['mit', 'apache-2.0', 'isc', 'artistic-2.0'].includes(
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

  setOptions() {
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
    this.option('gitOnly', {
      type: Boolean,
      required: false,
      default: true,
      description: g.f('Only update git tracked files'),
    });
    return super.setOptions();
  }

  async promptOwnerAndLicense() {
    const pkgFile = this.destinationPath('package.json');
    const pkg = this.fs.readJSON(this.destinationPath('package.json'));
    if (pkg == null) {
      this.exit(`${pkgFile} does not exist.`);
      return;
    }
    let author = _.get(pkg, 'author');
    if (typeof author === 'object') {
      author = author.name;
    }
    const owner =
      this.options.copyrightOwner || _.get(pkg, 'copyright.owner', author);
    const license = this.options.license || _.get(pkg, 'license');
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
    this.headerOptions = {
      copyrightOwner: answers.owner || this.options.owner,
      license: answers.license || this.options.license,
      log: this.log,
      gitOnly: this.options.gitOnly,
    };
  }

  async updateHeaders() {
    if (this.shouldExit()) return;
    await updateFileHeaders(this.destinationRoot(), this.headerOptions);
  }

  async end() {
    await super.end();
  }
};
