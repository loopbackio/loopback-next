// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {IConfigFile} from '@microsoft/api-extractor';
import path from 'node:path';
import fse from 'fs-extra';
import pkgJson from '@npmcli/package-json';
import mapWorkspaces from '@npmcli/map-workspaces';

/**
 * Typescript definition for
 * {@link https://github.com/lerna/lerna/blob/master/core/package/index.js | Lerna Package}
 */
export interface LernaPackage {
  /**
   * Package name
   */
  name: string;
  /**
   * Location of the package
   */
  location: string;
  /**
   * Root directory of the monorepo
   */
  rootPath: string;
  /**
   * Location of `package.json`
   */
  manifestLocation: string;
  /**
   * Is it a private package?
   */
  private: boolean;
}

/**
 * Get un-scoped package name
 *
 * @example
 * - '@loopback/context' => 'context'
 * - 'express' => 'express'
 *
 * @param name - Name of the npm package
 */
export function getUnscopedPackageName(name: string) {
  if (name.startsWith('@')) {
    return name.split('/')[1];
  }
  return name;
}

/**
 * Get workspace packages and sorted them by location
 *
 * @param rootDir - Root directory
 */
export async function getPackages(
  rootDir = process.cwd(),
): Promise<LernaPackage[]> {
  const {content: rootPkg} = await pkgJson.load(rootDir);
  const workspaces = await mapWorkspaces({cwd: rootDir, pkg: rootPkg});
  const packages: LernaPackage[] = await Promise.all(
    Array.from(workspaces, async ([name, location]) => {
      const {content: pkg} = await pkgJson.load(location);
      return {
        name,
        location,
        rootPath: rootDir,
        manifestLocation: path.join(location, 'package.json'),
        private: pkg.private ?? false,
      };
    }),
  );
  packages.sort((p1, p2) => p1.location.localeCompare(p2.location));
  return packages;
}

/**
 * Check if a package should be processed for tsdocs
 *
 * @param pkg - Lerna package
 */
export function shouldGenerateTsDocs(pkg: LernaPackage) {
  // We generate tsdocs for `@loopback/tsdocs` even it's private at this moment
  if (pkg.name === '@loopback/tsdocs') return true;

  if (pkg.private && pkg.name !== '@loopback/tsdocs') return false;

  /* istanbul ignore if  */
  if (pkg.name.startsWith('@loopback/example-')) return false;

  if (
    !fse.existsSync(path.join(pkg.location, 'tsconfig.build.json')) &&
    !fse.existsSync(path.join(pkg.location, 'tsconfig.json'))
  ) {
    return false;
  }

  /* istanbul ignore if  */
  return fse.existsSync(path.join(pkg.location, 'dist/index.d.ts'));
}

/**
 * Get an array of lerna-managed TypeScript packages to generate tsdocs
 *
 * @param rootDir - Root directory to find the monorepo
 */
export async function getPackagesWithTsDocs(
  rootDir = process.cwd(),
): Promise<LernaPackage[]> {
  const packages = await getPackages(rootDir);
  return packages.filter(shouldGenerateTsDocs);
}

/**
 * Default path for apidocs to be generated for loopback.io site
 */
export const DEFAULT_APIDOCS_GENERATION_PATH = 'docs/site/apidocs';

/**
 * Options for api docs
 */
export interface ApiDocsOptions {
  /**
   * To have a dry-run without generating api reports/doc models
   */
  dryRun?: boolean;
  /**
   * If `true`, do not print messages to console
   */
  silent?: boolean;
  /**
   * Root directory for the lerna-managed monorepo, default to current dir
   */
  rootDir?: string;
  /**
   * Path to tsdocs reports/models
   */
  apiDocsExtractionPath?: string;
  /**
   * Path to target directory to generate apidocs
   */
  apiDocsGenerationPath?: string;

  /**
   * A flag to generate default package documentation
   */
  generateDefaultPackageDoc?: boolean;

  /**
   * Package metadata
   */
  lernaPackages?: Record<string, LernaPackage>;
}

/**
 * Options to run api-extractor against the lerna repo
 */
export interface ExtractorOptions extends ApiDocsOptions {
  /**
   * Configuration for api-extractor
   */
  config?: IConfigFile;
  /**
   * Custom TypeScript compiler dir
   */
  typescriptCompilerFolder?: string;
  /**
   * Path for tsconfig
   */
  tsconfigFilePath?: string;
  /**
   * mainEntryPointFilePath
   */
  mainEntryPointFilePath?: string;
  /**
   * A flag to control if `apiReport` should be enabled
   */
  apiReportEnabled?: boolean;
  /**
   * A flag to control if errors should be ignored
   */
  ignoreErrors?: boolean;
}

/**
 * Default path as the output directory for extracted api reports and models
 */
export const DEFAULT_APIDOCS_EXTRACTION_PATH = 'docs/apidocs';

/**
 * Export the TypeScript path from `@loopback/build`
 */
export const typeScriptPath = require('@loopback/build').typeScriptPath;
