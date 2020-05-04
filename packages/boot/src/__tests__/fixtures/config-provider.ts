// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider} from '@loopback/context';

class ConfigProvider1 implements Provider<object> {
  value() {
    return {
      level: 'info',
      __source: 'js-provider',
    };
  }
}

class ConfigProvider2 implements Provider<object> {
  value() {
    return {
      level: 'debug',
      __source: 'js-provider',
    };
  }
}

export = {
  'loggers.Log1': ConfigProvider1,
  'loggers.Log2': ConfigProvider2,
};
