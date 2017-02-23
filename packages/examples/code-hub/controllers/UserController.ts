// The file name matches the exported class (UserController is defined in UserController.ts)
// This is the convention used in C# and Java too.

// https://www.npmjs.com/package/@types/http-errors
// https://github.com/jshttp/http-errors
import * as createHttpError from 'http-errors';

// Load OpenAPI specification for this controller
import spec = require('./users.api');

// Initially, bajtos was proposing
//   import {api} from '@loopback/controller-decorators';
// in order to allow 3rd party components to provide custom controllers
// while not depending on full loopback core
// After discussion with @ritch, we decided this is preliminary optimization
// that can be left for later

import {api, inject} from 'loopback';

// Notice that the controler is not required to extend any Controller base class
@api(spec)
export class UserController {
  // Remote methods are returning a Promise and should be implemented as async functions
  // This is required because most real world methods need to talk to other services,
  // which always takes more than a single tick of event loop
  //
  // This method can be called from other controllers/method the following way:
  //    const user: UserResponse = await userController.getUserByUsername('bajtos');
  //    console.log(user.email);
  public async getUserByUsername(username : string) : Promise<UserResponse> {

  }

  public async getAuthenticatedUser(@inject('userId') userId : number) : Promise<UserResponse> {
    if (userId !== 42) {
      // using "return Promise.reject(err)" would be probably faster (a possible micro-optimization)
      throw createHttpError.NotFound('Current user not found (?!).');
    }

    return new UserResponse({
      id: userId,
      name: 'Admin',
      email: 'admin@example.com',
    });
  }

  public updateAuthenticatedUser(@inject('userId') userId : number) : Promise<UserRespone> {

  }

  public getAllUsers(since : string) : Promise<Array<UserResponse>> {

  }
}

// Temporary definition for the initial iteration
export class UserResponse {
  id: number;
  name: string;
  email: string;

  constructor(data: Partial<UserResponse>) {
    Object.assign(this, data);
  }
}
