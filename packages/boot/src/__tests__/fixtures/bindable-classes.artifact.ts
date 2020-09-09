// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, BindingScope, inject, Provider} from '@loopback/core';

@bind({
  tags: {serviceType: 'local'},
  scope: BindingScope.SINGLETON,
})
export class BindableGreetingService {
  greet(whom = 'world') {
    return Promise.resolve(`Hello ${whom}`);
  }
}

@bind({tags: {serviceType: 'local', name: 'CurrentDate'}})
export class DateProvider implements Provider<Date> {
  value(): Promise<Date> {
    return Promise.resolve(new Date());
  }
}

export class NotBindableGreetingService {
  greet(whom = 'world') {
    return Promise.resolve(`Hello ${whom}`);
  }
}

export class NotBindableDateProvider implements Provider<Date> {
  value(): Promise<Date> {
    return Promise.resolve(new Date());
  }
}

export class ServiceWithConstructorInject {
  constructor(@inject('currentUser') private user: string) {}
}

export class ServiceWithPropertyInject {
  @inject('currentUser') private user: string;
}

export class ServiceWithMethodInject {
  greet(@inject('currentUser') user: string) {
    return `Hello, ${user}`;
  }
}
