// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, BindingScope, Provider} from '@loopback/core';

@bind({
  tags: {namespace: 'bindables'},
  scope: BindingScope.SINGLETON,
})
export class GreetingService {
  greet(whom: string = 'world') {
    return Promise.resolve(`Hello ${whom}`);
  }
}

@bind({tags: {namespace: 'bindables', name: 'CurrentDate'}})
export class DateProvider implements Provider<Date> {
  value(): Promise<Date> {
    return Promise.resolve(new Date());
  }
}

export class NotBindableGreetingService {
  greet(whom: string = 'world') {
    return Promise.resolve(`Hello ${whom}`);
  }
}

export class NotBindableDateProvider implements Provider<Date> {
  value(): Promise<Date> {
    return Promise.resolve(new Date());
  }
}
