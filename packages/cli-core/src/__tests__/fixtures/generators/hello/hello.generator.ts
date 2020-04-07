// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import Generator from 'yeoman-generator';

export class HelloGenerator extends Generator {
  // Note: arguments and options should be defined in the constructor.
  constructor(args: string | string[], options: {}) {
    super(args, options);
    this.argument('name', {
      type: String,
      required: false,
      default: 'World',
      description: 'Name',
    });
  }

  hello() {
    this.log('Hello, %s.', this.options.name);
  }
}
