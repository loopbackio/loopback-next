// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// A temporary polyfill for util.promisify on Node.js 6.x
// Remove it as part of https://github.com/strongloop/loopback-next/issues/611

'use strict';

const nativePromisify = require('util').promisify;

/**
 * Polyfill promisify and use `util.promisify` if available
 * @param func A callback-style function
 */
module.exports = function promisify(func) {
  if (nativePromisify) return nativePromisify(func);

  // The simplest implementation of Promisify
  return (...args) => {
    return new Promise((resolve, reject) => {
      try {
        func(...args, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      } catch (err) {
        reject(err);
      }
    });
  };
};
