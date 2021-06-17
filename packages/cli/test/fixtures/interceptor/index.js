// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const CONFIG_PATH = '.';

exports.SANDBOX_FILES = [
  {
    path: CONFIG_PATH,
    file: 'myinterceptorconfig.json',
    content: JSON.stringify({
      name: 'myInterceptor',
    }),
  },
];
