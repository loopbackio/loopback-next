import spec = require('./users.api');
import {Controller, api, inject} from "loopback";

@api(spec)
class UserController extends Controller {
  public getUserByUsername(username : string) : UserResponse {

  }

  public getAuthenticatedUser(@inject('userId') userId : string) : UserResponse {

  }

  public updateAuthenticatedUser(@inject('userId') userId : string) : UserRespone {

  }

  public getAllUsers(since : string) : Array<UserResponse> {

  }
}
