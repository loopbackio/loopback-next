// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const path = require('path');
const {FSE} = require('./fs');
const {getYears} = require('./git');
const {wrapText} = require('../../lib/utils');
const spdxLicenses = require('spdx-license-list/full');

spdxLicenses.CUSTOM = {
  name: 'Custom License',
  url: '',
  osiApproved: false,
  licenseText: '',
};

const spdxLicenseList = {};
for (const id in spdxLicenses) {
  spdxLicenseList[id.toLowerCase()] = {id, ...spdxLicenses[id]};
}

/**
 * Render license text
 * @param name - Module name
 * @param owner - Copyright owner
 * @param years - Years of update
 * @param license - License object
 */
function renderLicense({name, owner, years, license}) {
  if (typeof license === 'string') {
    license = spdxLicenseList[license.toLowerCase()];
  }
  let text = replaceCopyRight(license.licenseText, {owner, years});
  text = wrapText(text, 80);
  return `Copyright (c) ${owner} ${years}.
Node module: ${name}
This project is licensed under the ${license.name}, full text below.

--------

${text}
`;
  /*
Copyright (c) IBM Corp. 2018,2019. All Rights Reserved.
Node module: @loopback/boot
This project is licensed under the MIT License, full text below.

--------

MIT license

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
}

function replaceCopyRight(text, {owner, years}) {
  // Copyright (c) <YEAR> <COPYRIGHT HOLDERS>
  return text.replace(
    /Copyright \(c\) <[^<>]+> <[^<>]+>/gi,
    `Copyright (c) ${owner} ${years}`,
  );
}

async function updateLicense(projectRoot, pkg, options) {
  if (!options.updateLicense) return;
  const fs = options.fs || FSE;
  let licenseId = options.license;
  if (typeof licenseId === 'object') {
    licenseId = licenseId.id;
  }
  pkg.license = licenseId;
  pkg['copyright.owner'] = options.copyrightOwner;
  await fs.writeJSON(path.join(projectRoot, 'package.json'), pkg);
  await fs.write(
    path.join(projectRoot, 'LICENSE'),
    renderLicense({
      name: pkg.name,
      owner: options.copyrightOwner,
      license: options.license,
      years: await getYears(projectRoot),
    }),
  );
}

exports.renderLicense = renderLicense;
exports.spdxLicenseList = spdxLicenseList;
exports.updateLicense = updateLicense;
