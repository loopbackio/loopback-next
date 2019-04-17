import {BindingKey} from '@loopback/context';
import {BasicAuthenticationUserService} from './services/user-service';
import {UserRepository} from './users/user.repository';

export namespace BasicAuthenticationStrategyBindings {
  export const USER_SERVICE = BindingKey.create<BasicAuthenticationUserService>(
    'services.authentication.basic.user.service',
  );
  export const USER_REPO = BindingKey.create<UserRepository>(
    'services.authentication.basic.user.repo',
  );
}
