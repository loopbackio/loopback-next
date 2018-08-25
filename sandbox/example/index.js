// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/sandbox-example
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const distUtilPkg = require('@loopback/dist-util/package.json');
console.log('Resolved dependency: %s@%s', distUtilPkg.name, distUtilPkg.version);
