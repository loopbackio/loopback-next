import {inject, Provider, ValueOrPromise} from '@loopback/context';
import {BindingKeys, AuthenticationMetadata} from '@loopback/authentication';

import {Strategy} from 'passport';
import {BasicStrategy} from 'passport-http';

export class MyAuthStrategyProvider implements Provider<Strategy> {
  constructor(
    @inject(BindingKeys.Authentication.METADATA)
    private metadata: AuthenticationMetadata,
  ) {}

  value() : ValueOrPromise<Strategy> {
    const name = this.metadata.strategy;
    if (name === 'BasicStrategy') {
      return new BasicStrategy(this.verify);
    } else {
      return Promise.reject(`The strategy ${name} is not available.`);
    }
  }

  verify(username: string, password: string, cb: Function) {
    let userProfile = {
      username: username,
      password: password,
    };
    return cb(null, userProfile);
  }
}
