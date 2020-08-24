// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {execSync} from 'child_process';
import debugFactory from 'debug';
import fs from 'fs';
import minimist from 'minimist';
import path from 'path';
const debug = debugFactory('loopback:grpc:generator');

export type ProtoCodeGenerationOptions = {
  targetDir?: string;
  protoc?: string;
};

/**
 * Generate TypeScript code for the given proto file
 * @param protoFile - Proto file
 * @param options - Code generation options
 */
export function generateTsCode(
  protoFile: string,
  options: ProtoCodeGenerationOptions = {},
) {
  debug('proto file: %s', protoFile);
  const root = path.dirname(protoFile);
  const targetDir = options.targetDir ?? root;
  const isWin = process.platform === 'win32';
  const protocPath =
    options.protoc ??
    process.env.PROTOC ??
    path.join(
      __dirname,
      '../', // Root of grpc module and not the dist dir
      'compilers',
      process.platform,
      'bin',
      `protoc${isWin ? '.exe' : ''}`,
    );

  debug('protoc', protocPath);

  const pluginPath = require.resolve('grpc_tools_node_protoc_ts/package.json');

  debug('plugin module', pluginPath);

  const genTs = path.resolve(
    pluginPath,
    `../../.bin/protoc-gen-ts${isWin ? '.cmd' : ''}`,
  );

  debug('protoc-gen-ts', genTs);

  const cmd = `"${protocPath}" --plugin=protoc-gen-ts="${genTs}" --ts_out service=true:"${targetDir}" -I "${root}" "${protoFile}"`;

  debug('protoc command', cmd);
  execSync(cmd);
  const files = fs.readdirSync(targetDir);
  for (const f of files) {
    if (f.endsWith('.d.ts')) {
      const tsFile = f.replace(/\.d\.ts$/, '.ts');
      debug('Renaming %s to %s', f, tsFile);
      fs.renameSync(path.join(targetDir, f), path.join(targetDir, tsFile));
    }
  }
}

if (require.main === module) {
  const parsedArgs = minimist(process.argv.slice(2), {
    alias: {
      d: 'target',
      c: 'protoc',
      s: 'silent',
    },
    boolean: ['s'],
  });
  const options: ProtoCodeGenerationOptions = {
    targetDir: parsedArgs.d ?? process.cwd(),
    protoc: parsedArgs.c,
  };
  const files = parsedArgs._;
  if (files.length === 0) {
    console.error(
      'Usage: %s %s [options] <proto-files>',
      'node',
      path.relative(process.cwd(), process.argv[1]),
    );
    console.error(`Available options:
-s: enable silent mode
-c <protoc-command>: customize protoc command
-d <target-dir>: set target directory for the generated code`);
  } else {
    for (const f of files) {
      if (!parsedArgs.s) {
        console.log('Generating gRPC TypeScript code for %s...', f);
      }
      generateTsCode(f, options);
    }
  }
}
