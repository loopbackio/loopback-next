// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = {
  extends: [
    '@commitlint/config-angular',
    '@commitlint/config-lerna-scopes'
  ],
  rules: {
    'header-max-length': [2, 'always', 100],
    'footer-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [0, 'always'],
  }
}
