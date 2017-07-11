import {authenticatedUser} from '@loopback/authentication';
import {AUTHORIZATION_ROLE} from '@loopback/authorization';

export class Role {
  constructor(
    private @authenticatedUser() user
  )
  name = AUTHORIZATION_ROLE; // 'authorization.role'
  value() {
    return user.isAdmin ? 'admin' : 'default';
  }
}