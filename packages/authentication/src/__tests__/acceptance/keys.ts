import {BindingKey} from '@loopback/context';
import {JWTService} from './services/token-service';
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

export namespace JWTAuthenticationStrategyBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<JWTService>(
    'services.authentication.jwt.tokenservice',
  );
}
