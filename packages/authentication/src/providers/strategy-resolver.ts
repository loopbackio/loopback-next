import {Provider, inject, ValueOrPromise} from '@loopback/context';
import {AuthStrategy} from '../strategies';
import {AuthenticationBindings, AuthenticationMetadata} from '../..';
import * as _ from 'lodash';

export class StrategyResolverProvider
  implements Provider<AuthStrategy | undefined> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
  ) {}

  value(): ValueOrPromise<AuthStrategy | undefined> {
    // tslint:disable-next-line:no-unused
    const strategyName = this.metadata && this.metadata.strategy;

    // Extension point
    // Responsibility of the extension point:
    // 1. return corresponding strategy if found
    // 2. throw error if strategy is not available
    // switch (name) {
    //  case 'jwt':
    //    return JWTStrategy();
    //  case 'openid':
    //    return OpenidStrategy();
    //  default:
    //    return;
    // }
    return;
  }
}
