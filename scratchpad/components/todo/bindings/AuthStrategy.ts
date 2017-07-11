import {AUTHENTICATION_STRATEGY} from '@loopback/authentication';
import {BasicStrategy} from '@passport/basic';

export class AuthStrategy {
  constructor(
    private @userRepo() users
  )
  name = AUTHENTICATION_STRATEGY; // 'authentication.strategy'
  value() {
    return new BasicStrategy(async (username, password) => {
      const user = await this.users.findById(username);
      if (user.password === password) {
        return user;
      }
    });
  }
}