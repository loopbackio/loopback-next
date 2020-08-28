// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import minimist from 'minimist';
import path from 'path';
import {pbjs, pbts} from 'protobufjs/cli';
const debug = debugFactory('loopback:grpc:generator');

/**
 * Run `pbjs` to generate a JavaScript file for the list of proto files
 * @param outFile - JavaScript file name
 * @param protoFiles - A list of proto file names
 */
export function runPbjs(outFile: string, ...protoFiles: string[]) {
  const args = [
    '-t',
    'static-module',
    '-w',
    'commonjs',
    '-o',
    outFile,
    ...protoFiles,
  ];
  debug('pbjs %s', args.join(' '));
  return new Promise<string | undefined>((resolve, reject) => {
    pbjs.main(args, (err, output) => {
      if (err) return reject(err);
      debug('Output', output);
      resolve(output);
    });
  });
}

/**
 * Run `pbts` to generate a TypeScript definition (.d.ts) file for a list of
 * proto JavaScript files
 * @param outFile - TypeScript definition file name
 * @param jsFiles - A list of proto JavaScript file names
 */
export function runPbts(outFile: string, ...jsFiles: string[]) {
  const args = [
    '-t',
    'static-module',
    '-w',
    'commonjs',
    '-o',
    outFile,
    ...jsFiles,
  ];
  debug('pbts %s', args.join(' '));
  return new Promise<string | undefined>((resolve, reject) => {
    pbts.main(args, (err, output) => {
      if (err) return reject(err);
      debug('Output', output);
      resolve(output);
    });
  });
}

/**
 * Generate code for a list of proto files
 * @param outFile - Generated JavaScript file name
 * @param protoFiles - A list of proto file names
 */
export async function generateTsCode(outFile: string, ...protoFiles: string[]) {
  const jsFile = outFile.replace(/(\.d\.ts|\.ts)$/, '.js');
  await runPbjs(jsFile, ...protoFiles);
  const tsFile = outFile.replace(/\.js$/, '.d.ts');
  await runPbts(tsFile, outFile);
}

if (require.main === module) {
  const parsedArgs = minimist(process.argv.slice(2), {
    alias: {
      d: 'target',
      s: 'silent',
    },
    boolean: ['s'],
  });
  const target = parsedArgs.d ?? 'proto.js';
  const files = parsedArgs._;
  if (files.length === 0) {
    console.error(
      'Usage: %s %s [options] <proto-files>',
      'node',
      path.relative(process.cwd(), process.argv[1]),
    );
    console.error(`Available options:
-s: enable silent mode
-d <target-file>: set target directory for the generated code`);
  } else {
    if (!parsedArgs.s) {
      console.log('Generating gRPC TypeScript code for %s...', files);
    }
    generateTsCode(target, ...files).catch(err => {
      console.error(err);
    });
  }
}
