// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// https://www.npmjs.com/package/@types/http-errors
// https://github.com/jshttp/http-errors

import {HttpErrors} from '@loopback/core';

// Load OpenAPI specification for this controller
import {def} from './user-controller.api';

// Initially, bajtos was proposing
//   import {api} from '@loopback/controller-decorators';
// in order to allow 3rd party components to provide custom controllers
// while not depending on full loopback core
// After discussion with @ritch, we decided this is preliminary optimization
// that can be left for later

import {api, inject} from '@loopback/core';

// Notice that the controler is not required to extend any Controller base class
@api(def)
export class UserController {
  // Remote methods are returning a Promise and should be implemented as
  // async functions
  // This is required because most real world methods need to talk to
  // other services, which always takes more than a single tick of event loop
  //
  // This method can be called from other controllers/method the following way:
  //    const user: UserResponse =
  //      await userController.getUserByUsername('bajtos');
  //    console.log(user.email);
  public async getUserByUsername(username: string): Promise<UserResponse> {
    return new UserResponse({name: username});
  }

  public async getAuthenticatedUser(
    @inject('userId') userId: number,
  ): Promise<UserResponse> {
    if (userId !== 42) {
      // using "return Promise.reject(err)" would be probably faster
      // (a possible micro-optimization)
      throw new HttpErrors.NotFound('Current user not found (?!).');
    }

    return new UserResponse({
      id: userId,
      name: 'Admin',
      email: 'admin@example.com',
    });
  }

  public async updateAuthenticatedUser(
    @inject('userId') userId: number,
  ): Promise<UserResponse> {
    return new UserResponse({id: userId});
  }

  public async getAllUsers(since: string): Promise<Array<UserResponse>> {
    return [];
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
