// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const fs = require('fs');
const {promisify} = require('util');
const child_process = require('child_process');
const split = require('split2');
const {getPackages} = require('@lerna/project');

const fileExists = promisify(fs.exists);

let packagesInBuild = 0;

getPackages()
  .then(packages => Promise.all(packages.map(watchPackage)))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

async function watchPackage(p) {
  const tsconfig = `${p.location}/tsconfig.build.json`;
  const hasBuildConfig = await fileExists(tsconfig);
  if (!hasBuildConfig) {
    console.log(`Skipping ${p.name} - tsconfig.build.json not found`);
    return;
  }

  console.log(`Starting "tsc -w" for ${p.name}`);
  const child = child_process.spawn(
    process.execPath, // Typically '/usr/local/bin/node'
    [
      require.resolve('typescript/lib/tsc'), // see typescript/bin/tsc
      '--preserveWatchOutput',
      '-p',
      tsconfig,
      // TODO(bajtos) move outDir setting to tsconfig.build.json file
      '--outDir',
      `${p.location}/dist`,
      '-w',
    ],
    {
      stdio: [
        'ignore', // no stdio
        'pipe', // pipe stdout for reading
        'inherit', // forward stderr to our stderr
      ],
    },
  );
  child.stdout
    // split data to lines
    .pipe(split())
    // print lines to our output
    .on('data', line => {
      if (/Starting.*compilation/.test(line)) {
        if (!packagesInBuild) {
          // forward the output to VS Code problem matcher
          console.log(line);
        }
        packagesInBuild++;
        console.log('(building %s)', p.name);
      } else if (/Watching for file changes/.test(line)) {
        console.log('(%s was compiled)', p.name);
        packagesInBuild--;
        if (!packagesInBuild) {
          // forward the output to VS Code problem matcher
          console.log(line);
        }
      } else {
        console.log(line);
      }
    });
}
