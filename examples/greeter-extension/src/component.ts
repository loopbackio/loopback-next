// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, createBindingFromClass, Component} from '@loopback/core';
import {ChineseGreeter} from './greeters/greeter-cn';
import {EnglishGreeter} from './greeters/greeter-en';
import {GreetingService} from './greeting-service';
import {GREETING_SERVICE} from './keys';

/**
 * Define a component to register the greeter extension point and built-in
 * extensions
 */
export class GreetingComponent implements Component {
  bindings: Binding[] = [
    createBindingFromClass(GreetingService, {
      key: GREETING_SERVICE,
    }),
    createBindingFromClass(EnglishGreeter),
    createBindingFromClass(ChineseGreeter),
  ];
}
