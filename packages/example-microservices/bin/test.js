'use strict';

let Promise = require('bluebird');
let exec = require('child_process').execSync;
let spawn = require('child_process').spawn;
let fs = Promise.promisifyAll(require('fs'));
let path = require('path');

let cmd = path.resolve(__dirname, '..', 'node_modules', '.bin', '_mocha');
let args = ['--compilers', 'ts:ts-node/register,tsx:ts-node/register'];

let services = path.resolve('services');
return fs.readdirAsync(services).then(folders => {
  return Promise.each(folders, f => {
    let dir = path.resolve(services, f);
    return fs
      .readdirAsync(dir)
      .then(subfolders => {
        if (subfolders.indexOf('test') > -1) {
          return new Promise((resolve, reject) => {
            console.log('RUN TESTS - %s:', f);
            let testArgs = args.push(path.resolve(dir, 'test/**/*test.ts'));
            // Install dependencies
            exec('npm i', {
              cwd: dir
            });
            let test = spawn(cmd, args);
            test.stdout.on('data', out => {
              console.log(out.toString());
            });

            test.stderr.on('data', out => {
              console.error(out.toString());
            });

            test.on('close', code => {
              if (code) {
                return reject(code);
              } else {
                console.log('TEST SUCCESS - %s', f);
                return resolve();
              }
            });
          });
        } else {
          console.log('No "test" folder was found in %s', f);
          return Promise.resolve();
        }
      })
      .catch(code => {
        console.error('TESTS FAILED - %s, exit code %s', f, code);
        return process.exit(code);
      });
  }).then(() => {
    console.log('TESTS COMPLETE');
  });
});
