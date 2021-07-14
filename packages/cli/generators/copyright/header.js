// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {Project} = require('@lerna/project');
const {Minimatch} = require('minimatch');
const _ = require('lodash');
const path = require('path');
const chalk = require('chalk');
const {git, getYears} = require('./git');
const {FSE, jsOrTsFiles} = require('./fs');
const {spdxLicenseList} = require('./license');

const debug = require('debug')('loopback:cli:copyright');

// Components of the copyright header.
const COPYRIGHT = [
  ' Copyright <%= owner %> <%= years %>. All Rights Reserved.',
  ' Node module: <%= name %>',
];
const LICENSE = [
  ' This file is licensed under the <%= license %>.',
  ' License text available at <%= url %>',
];

// Compiled templates for generating copyright headers
const LICENSED = _.template(COPYRIGHT.concat(LICENSE).join('\n'));

function getCustomTemplate(customLicenseLines = []) {
  if (typeof customLicenseLines === 'string') {
    customLicenseLines = [customLicenseLines];
  }
  const UNLICENSED = _.template(COPYRIGHT.join('\n'));
  let CUSTOM = UNLICENSED;
  if (customLicenseLines.length) {
    let copyrightLines = COPYRIGHT;
    if (customLicenseLines.some(line => line.includes('Copyright'))) {
      copyrightLines = [];
    }
    CUSTOM = _.template(copyrightLines.concat(customLicenseLines).join('\n'));
  }
  return CUSTOM;
}

// Patterns for matching previously generated copyright headers
const BLANK = /^\s*$/;

/**
 * Preserve characters that have special meaning for RegExp
 * @param {string} text - Text
 */
function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function getHeaderRegEx(customLicenseLines) {
  const lines =
    customLicenseLines != null && customLicenseLines.length
      ? customLicenseLines
      : COPYRIGHT.concat(LICENSE, customLicenseLines);
  const regExp = lines.map(
    l => new RegExp(escapeRegExp(l).replace(/<%[^>]+%>/g, '.*')),
  );
  return regExp;
}

/**
 * Build header for a file
 * @param {string} file - JS/TS file
 * @param {object} pkg - Package json object
 * @param {object} options - Options
 */
async function buildHeader(file, pkg, options) {
  const license =
    options.license || _.get(pkg, 'license') || options.defaultLicense;
  const years = await getYears(file);
  const params = expandLicense(license, options.customLicenseLines);
  params.years = years.join(',');
  const owner = getCopyrightOwner(pkg, options);

  const name =
    options.copyrightIdentifer ||
    _.get(pkg, 'copyright.identifier') ||
    _.get(pkg, 'name') ||
    options.defaultCopyrightIdentifer;

  debug(owner, name, license);

  _.defaults(params, {
    owner,
    name,
    license,
  });
  debug('Params', params);
  return params.template(params);
}

function getCopyrightOwner(pkg, options) {
  return (
    options.copyrightOwner ||
    _.get(pkg, 'copyright.owner') ||
    _.get(pkg, 'author.name') ||
    options.defaultCopyrightOwner ||
    'Owner'
  );
}

/**
 * Build the license template params
 * @param {string|object} spdxLicense - SPDX license id or object
 */
function expandLicense(spdxLicense, customLicenseLines = []) {
  if (typeof spdxLicense === 'string') {
    spdxLicense = spdxLicenseList[spdxLicense.toLowerCase()];
  }
  if (spdxLicense && spdxLicense.id !== 'CUSTOM') {
    return {
      template: LICENSED,
      license: spdxLicense.name,
      url: spdxLicense.url,
    };
  }
  return {
    template: getCustomTemplate(customLicenseLines),
    license: spdxLicense,
  };
}

/**
 * Format the header for a file
 * @param {string} file - JS/TS file
 * @param {string} pkg - Package json object
 * @param {object} options - Options
 */
async function formatHeader(file, pkg, options) {
  const header = await buildHeader(file, pkg, options);
  return header.split('\n').map(line => `//${line}`);
}

/**
 * Ensure the file is updated with the correct header
 * @param {string} file - JS/TS file
 * @param {object} pkg - Package json object
 * @param {object} options - Options
 */
async function ensureHeader(file, pkg, options = {}) {
  const fs = options.fs || FSE;
  const header = await formatHeader(file, pkg, options);
  debug('Header: %s', header);
  const current = await fs.read(file, 'utf8');
  const content = mergeHeaderWithContent(
    header,
    current,
    options.customLicenseLines,
  );
  if (!options.dryRun) {
    await fs.write(file, content, 'utf8');
  } else {
    const log = options.log || console.log;
    log(file, header);
  }
  return content;
}

/**
 * Merge header with file content
 * @param {string} header - Copyright header
 * @param {string} content - File content
 * @param {string[]} customLicenseLines - Custom license lines
 */
function mergeHeaderWithContent(header, content, customLicenseLines) {
  const lineEnding = /\r\n/gm.test(content) ? '\r\n' : '\n';
  const preamble = [];
  content = content.split(lineEnding);
  if (/^#!/.test(content[0])) {
    preamble.push(content.shift());
  }
  const patterns = getHeaderRegEx(customLicenseLines);
  // replace any existing copyright header lines and collapse blank lines down
  // to just one.
  while (headerOrBlankLine(content[0], patterns)) {
    content.shift();
  }
  return [].concat(preamble, header, '', content).join(lineEnding);
}

function headerOrBlankLine(line, patterns) {
  return BLANK.test(line) || patterns.some(pat => pat.test(line));
}

/**
 * Update file headers for the given project
 * @param {string} projectRoot - Root directory of a package or a lerna monorepo
 * @param {object} options - Options
 */
async function updateFileHeaders(projectRoot, options = {}) {
  debug('Starting project root: %s', projectRoot);
  options = {
    dryRun: false,
    gitOnly: true,
    ...options,
  };

  const fs = options.fs || FSE;
  const isMonorepo = await fs.exists(path.join(projectRoot, 'lerna.json'));
  if (isMonorepo) {
    // List all packages for the monorepo
    const project = new Project(projectRoot);
    debug('Lerna monorepo', project);
    const packages = await project.getPackages();

    // Update file headers for each package
    const visited = [];
    for (const p of packages) {
      visited.push(p.location);
      const pkgOptions = {...options};
      // Set default copyright owner and id so that package-level settings
      // take precedence
      pkgOptions.defaultCopyrightIdentifer = options.copyrightIdentifer;
      pkgOptions.defaultCopyrightOwner = options.copyrightOwner;
      pkgOptions.defaultLicense = options.license;
      delete pkgOptions.copyrightOwner;
      delete pkgOptions.copyrightIdentifer;
      delete pkgOptions.license;
      await updateFileHeaders(p.location, pkgOptions);
    }

    // Now handle the root level package
    // Exclude files that have been processed
    const filter = f => {
      const included = !visited.some(dir => {
        dir = path.relative(projectRoot, dir);
        // glob return files with `/`
        return f.startsWith(path.join(dir, '/').replace(/\\/g, '/'));
      });
      if (included) {
        debug('File %s is included for monorepo package', f);
      }
      return included;
    };
    const pkgOptions = {filter, ...options};
    await updateFileHeadersForSinglePackage(projectRoot, pkgOptions);
  } else {
    await updateFileHeadersForSinglePackage(projectRoot, options);
  }
}

/**
 * Update file headers for the given project
 * @param {string} projectRoot - Root directory of a package
 * @param {object} options - Options
 */
async function updateFileHeadersForSinglePackage(projectRoot, options) {
  debug('Options', options);
  debug('Project root: %s', projectRoot);
  const log = options.log || console.log;
  const pkgFile = path.join(projectRoot, 'package.json');
  const fs = options.fs || FSE;
  const exists = await fs.exists(pkgFile);
  if (!exists) {
    log(chalk.red(`No package.json exists at ${projectRoot}`));
    return;
  }
  const pkg = await fs.readJSON(pkgFile);

  log(
    'Updating project %s (%s)',
    pkg.name,
    path.relative(process.cwd(), projectRoot) || '.',
  );
  debug('Package', pkg);
  let files = options.gitOnly ? await git(projectRoot, 'ls-files') : [];
  debug('Paths', files);
  files = await jsOrTsFiles(projectRoot, files);
  if (typeof options.filter === 'function') {
    files = files.filter(options.filter);
  }
  debug('JS/TS files', files);
  if (Array.isArray(options.excludePatterns)) {
    debug('Exclude', options.excludePatterns);
    files = files.filter(
      f =>
        !options.excludePatterns.some(p => {
          const minimatch = new Minimatch(p, {dot: true});
          const result = minimatch.match(f);
          debug('Matching %s against %s:', f, p, result);
          return result;
        }),
    );
  }
  debug('JS/TS files excluding %s:', options.excludePatterns, files);
  for (const file of files) {
    await ensureHeader(path.resolve(projectRoot, file), pkg, options);
  }
}

exports.updateFileHeaders = updateFileHeaders;
exports.getYears = getYears;

if (require.main === module) {
  updateFileHeaders(process.cwd()).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
