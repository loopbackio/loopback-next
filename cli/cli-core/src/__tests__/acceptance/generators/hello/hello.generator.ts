// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import Generator from 'yeoman-generator';
import {generator} from '../../../../decorators/generator';

@generator('hello', __dirname)
export class HelloGenerator extends Generator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args: string | string[], options: {}) {
    super(args, options);
  }

  hello() {
    this.log('Hello');
  }
}
