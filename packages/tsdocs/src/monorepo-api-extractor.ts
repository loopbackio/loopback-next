// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  CompilerState,
  ConsoleMessageId,
  Extractor,
  ExtractorConfig,
  ExtractorLogLevel,
  ExtractorMessage,
  ExtractorResult,
  IConfigFile,
} from '@microsoft/api-extractor';
import * as debugFactory from 'debug';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  DEFAULT_APIDOCS_EXTRACTION_PATH,
  ExtractorOptions,
  getPackagesWithTsDocs,
  LernaPackage,
  typeScriptPath,
} from './helper';
const debug = debugFactory('loopback:tsdocs');

/**
 * Run api-extractor for a lerna-managed monrepo
 *
 * @remarks
 * The function performs the following steps:
 * 1. Discover packages with tsdocs from the monorepo
 * 2. Iterate through each package to run `api-extractor`
 *
 * @param options - Options for running api-extractor
 */
export async function runExtractorForMonorepo(options: ExtractorOptions = {}) {
  debug('Extractor options:', options);

  options = Object.assign(
    {
      rootDir: process.cwd(),
      apiDocsExtractionPath: DEFAULT_APIDOCS_EXTRACTION_PATH,
      typescriptCompilerFolder: typeScriptPath,
      tsconfigFilePath: 'tsconfig.build.json',
      mainEntryPointFilePath: 'dist/index.d.ts',
    },
    options,
  );

  const packages = await getPackagesWithTsDocs(options.rootDir);

  /* istanbul ignore if  */
  if (!packages.length) return;

  const lernaRootDir = packages[0].rootPath;

  /* istanbul ignore if  */
  if (!options.silent) {
    console.log('Running api-extractor for lerna repo: %s', lernaRootDir);
  }

  setupApiDocsDirs(lernaRootDir, options);

  for (const pkg of packages) {
    /* istanbul ignore if  */
    invokeExtractorForPackage(pkg, options);
  }
}

export function runExtractorForPackage(
  pkgDir: string = process.cwd(),
  options: ExtractorOptions = {},
) {
  options = Object.assign(
    {
      rootDir: pkgDir,
      apiDocsExtractionPath: DEFAULT_APIDOCS_EXTRACTION_PATH,
      typescriptCompilerFolder: typeScriptPath,
      tsconfigFilePath: 'tsconfig.build.json',
      mainEntryPointFilePath: 'dist/index.d.ts',
    },
    options,
  );
  const pkgJson = require(path.join(pkgDir, 'package.json'));
  setupApiDocsDirs(pkgDir, options);
  const pkg: LernaPackage = {
    private: pkgJson.private,
    name: pkgJson.name,
    location: pkgDir,
    manifestLocation: path.join(pkgDir, 'package.json'),
    rootPath: pkgDir,
  };
  invokeExtractorForPackage(pkg, options);
}

/**
 * Run `api-extractor` on a given package
 * @param pkg - Package descriptor
 * @param options - Options for api extraction
 */
function invokeExtractorForPackage(
  pkg: LernaPackage,
  options: ExtractorOptions,
) {
  if (!options.silent) {
    console.log('> %s', pkg.name);
  }
  debug('Package: %s (%s)', pkg.name, pkg.location);
  process.chdir(pkg.location);
  const extractorConfig = buildExtractorConfig(pkg, options);
  debug('Resolved extractor config:', extractorConfig);
  invokeExtractor(extractorConfig, options);
}

/**
 * Set up dirs for apidocs
 *
 * @param lernaRootDir - Root dir of the monorepo
 * @param options - Extractor options
 */
function setupApiDocsDirs(lernaRootDir: string, options: ExtractorOptions) {
  /* istanbul ignore if  */
  if (options.dryRun) return;
  const apiDocsExtractionPath = options.apiDocsExtractionPath!;

  fs.emptyDirSync(path.join(lernaRootDir, `${apiDocsExtractionPath}/models`));

  if (!options.apiReportEnabled) return;

  fs.ensureDirSync(path.join(lernaRootDir, `${apiDocsExtractionPath}/reports`));
  fs.emptyDirSync(
    path.join(lernaRootDir, `${apiDocsExtractionPath}/reports-temp`),
  );
}

/**
 * Build extractor configuration object for the given package
 *
 * @param pkg - Lerna managed package
 * @param options - Extractor options
 */
function createRawExtractorConfig(
  pkg: LernaPackage,
  options: ExtractorOptions,
) {
  const entryPoint = path.join(pkg.location, options.mainEntryPointFilePath!);
  const apiDocsExtractionPath = options.apiDocsExtractionPath!;
  let configObj: IConfigFile = {
    projectFolder: pkg.location,
    mainEntryPointFilePath: entryPoint,
    apiReport: {
      enabled: !!options.apiReportEnabled,
      reportFolder: path.join(pkg.rootPath, `${apiDocsExtractionPath}/reports`),
      reportTempFolder: path.join(
        pkg.rootPath,
        `${apiDocsExtractionPath}/reports-temp`,
      ),
      reportFileName: '<unscopedPackageName>.api.md',
    },
    docModel: {
      enabled: true,
      apiJsonFilePath: path.join(
        pkg.rootPath,
        `${apiDocsExtractionPath}/models/<unscopedPackageName>.api.json`,
      ),
    },
    messages: {
      extractorMessageReporting: {
        'ae-missing-release-tag': {
          logLevel: ExtractorLogLevel.None,
          addToApiReportFile: false,
        },
      },
    },
    compiler: {
      tsconfigFilePath: options.tsconfigFilePath!,
    },
  };
  /* istanbul ignore if  */
  if (options.config) {
    configObj = Object.assign(configObj, options.config);
  }
  debug('Extractor config options:', configObj);
  return configObj;
}

/**
 * Create and prepare the extractor config for invocation
 *
 * @param pkg - Lerna package
 * @param options - Extractor options
 */
function buildExtractorConfig(pkg: LernaPackage, options: ExtractorOptions) {
  const configObj: IConfigFile = createRawExtractorConfig(pkg, options);
  const extractorConfig = ExtractorConfig.prepare({
    configObject: configObj,
    configObjectFullPath: '',
    packageJsonFullPath: pkg.manifestLocation,
  });
  return extractorConfig;
}

/**
 * Invoke the extractor
 *
 * @param extractorConfig - Resolved config
 * @param options - Extractor options
 */
function invokeExtractor(
  extractorConfig: ExtractorConfig,
  options: ExtractorOptions,
) {
  const compilerState = CompilerState.create(extractorConfig, {
    // typescriptCompilerFolder: options.typescriptCompilerFolder,
  });

  /* istanbul ignore if  */
  if (options.dryRun) return;

  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    typescriptCompilerFolder: options.typescriptCompilerFolder,
    localBuild: true,
    showVerboseMessages: !options.silent,
    messageCallback: (message: ExtractorMessage) => {
      if (message.messageId === ConsoleMessageId.ApiReportCreated) {
        // This script deletes the outputs for a clean build,
        // so don't issue a warning if the file gets created
        message.logLevel = ExtractorLogLevel.None;
      }
    },
    compilerState,
  });
  debug(extractorResult);
}
