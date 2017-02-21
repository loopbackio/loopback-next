import spec = require('./users.api');
import {Controller, api, inject} from "loopback";

@api(spec)
export class UserController extends Controller {
  public getUserByUsername(username : string) : UserResponse {

  }

  public getAuthenticatedUser(@inject('userId') userId : number) : UserResponse {
    if(userId === 42) {
      let ur = UserResponse();
      ur.id = userId;
      ur.name = 'Foo Bar';
      return ur;
    } else {
      throw new NotFoundError();
    }
  }

  public updateAuthenticatedUser(@inject('userId') userId : number) : UserRespone {

  }

  public getAllUsers(since : string) : Array<UserResponse> {

  }
}


class NotFoundError {
  code : number = 404;
}
