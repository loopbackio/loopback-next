import {File, get} from '@loopback/core';
import {role} from '@loopback/authorization';
import {publicDir} from '../bindings/PublicDir.ts';

export class WebController {
  constructor(
    private @publicDir() public
  ) {}
  @get('/')
  index() {
    return new File(path.join(this.public, 'index.html'));
  }
  @get('/admin')
  @role('admin')
  admin() {
    return new File(path.join(this.public, 'admin.html'));
  }
  @get('/login')
  login() {
    return new File(path.join(this.public, 'login.html'));
  }
}