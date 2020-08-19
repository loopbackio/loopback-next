// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = {
  extends: [
    '@commitlint/config-conventional',
    // https://github.com/marionebl/commitlint/pull/406
    // '@commitlint/config-lerna-scopes',
    './bin/config-lerna-scopes',
  ],
  rules: {
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [0, 'always'],
    'signed-off-by': [2, 'always', 'Signed-off-by:'],
  },
};
