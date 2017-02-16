// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { exec, ExecOptions } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const PROJECTS = {
  metadata: subdir('metadata'),
  controller: subdir('component-controller'),
  app: subdir('app'),
};

build()
  .catch(err => { console.log('FAIL:', err); process.exit(1); })
  .then(test)
  .catch(err => process.exit(1)); // do not report "exec" failed

async function build() {
  await clean();

  await compile(PROJECTS.metadata);

  await install(PROJECTS.controller);
  await compile(PROJECTS.controller);

  await makeVersion2(PROJECTS.metadata);

  await install(PROJECTS.app);
  await compile(PROJECTS.app);
}

async function test() {
  console.log('\n--CHECK--\n');
  await execAsync('./node_modules/.bin/mocha test.js', { cwd: PROJECTS.app });
}

// copy metadata to metadata-v2, change version in package.json

function subdir(name: string): string {
  return path.resolve(__dirname, name);
}

async function clean() {
  console.log('--CLEAN--');

  const dirs = Object.keys(PROJECTS)
    .map(k => PROJECTS[k])
    .map(p => [path.join(p, 'node_modules'), path.join(p, 'lib')])
    .concat(['metadata-v2', 'model-v2'].map(subdir))
    .reduce((prev, cur) => prev.concat(cur), []);

  console.log(dirs.map(d => '  rm -rf ' + d).join('\n'));

  await execAsync('rm -rf ' + dirs.join(' '));
}
async function compile(project: string): Promise<void> {
  console.log('--COMPILE %s--', project);
  return execAsync('tsc', { cwd: project });
}

async function install(project: string): Promise<void> {
  console.log('--INSTALL %s--', project);
  return execAsync('npm install -s', { cwd: project });
}

async function makeVersion2(project: string): Promise<void> {
  const target = subdir(path.basename(project) + '-v2');
  console.log('--COPY %s TO %s as version 1.2.0', project, target);
  await execAsync('cp -r ' + project + ' ' + target);
  const pkgFile = path.join(target, 'package.json');
  const meta = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
  meta.version = '1.2.0';
  fs.writeFileSync(pkgFile, JSON.stringify(meta, null, 2));
}

async function execAsync(command: string, opts?: ExecOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    exec(command, opts || {}, (err, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (err) reject(err);
      else resolve();
    });
  });
}
