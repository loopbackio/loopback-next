// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind} from '@loopback/context';
import {asGreeter, Greeter} from '../types';

/**
 * A greeter implementation for English
 */
@bind(asGreeter)
export class EnglishGreeter implements Greeter {
  language = 'en';

  greet(name: string) {
    return `Hello, ${name}!`;
  }
}
