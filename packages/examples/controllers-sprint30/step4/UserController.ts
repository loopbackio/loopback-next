//////////////////////////////////////////////////////
// STEP 2:
//  - integrate with context/DI
//  - inject method parameters
//////////////////////////////////////////////////////

import {controller, endpoint, response, inject} from '@loopback/controllers';

// https://www.npmjs.com/package/@types/http-errors
// https://github.com/jshttp/http-errors
import * as createHttpError from 'http-errors';

// a Stub model
class UserModel {
  id: number;
  email: string;

  constructor(data: Partial<UserModel>) {
    Object.assign(this, data);
  }
};

@controller('/users')
export class HelloWorldController {

  @endpoint('GET', '/headers')
  // $ref should be translated to '#/definitions/UserModel' by the swagger producer
  // (out of scope of this patch)
  @response(200, { $ref: UserModel })
  public async getAuthenticatedUser(@inject('userId') userId : number) : Promise<UserModel> {
    if(userId === 42) {
      return new UserResponse({ id: userId, email: 'admin@example.com' });
    }

    return Promise.reject(createHttpError.NotFound(`Unknown user id: {userId}`))
  }
}
