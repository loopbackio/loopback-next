// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {oas, post, requestBody} from '@loopback/openapi-v3';
import {Model, model, property} from '@loopback/repository';
import {BindingKeys, Models} from './schemas';

@model()
class LoginBody extends Model {
  @property()
  firstName: string;

  @property()
  lastName: string;
}

@model()
class LoginResponse extends Model {
  constructor(d: Partial<LoginResponse>) {
    super(d);
  }
  @property()
  createdAt: Date;
}

export default class UserController {
  constructor(
    @inject(BindingKeys.Connection1.User) private userModel: Models.User,
    @inject(BindingKeys.Connection1.Event) private eventModel: Models.Event,
    @inject(BindingKeys.Connection1.LoginEvent)
    private loginEventModel: Models.LoginEvent,
  ) {}

  @post('/login')
  public async userLogin(@requestBody() body: LoginBody) {
    let user = await this.userModel.findOne({
      firstName: body.firstName,
      lastName: body.lastName,
    });
    if (!user) {
      user = await this.userModel.create({
        firstName: body.firstName,
        lastName: body.lastName,
      });
    }

    await this.loginEventModel.create({_user: user});
  }

  @post('/find')
  @oas.response(200, [LoginResponse])
  public async findUserLogins(@requestBody() body: LoginBody) {
    const user = await this.userModel.findOne({
      firstName: body.firstName,
      lastName: body.lastName,
    });

    if (!user) {
      return [];
    }
    const events = await this.eventModel.find({
      _user: user._id,
    });

    if (events) {
      return events.map(e => new LoginResponse({createdAt: e.createdAt}));
    } else {
      return [];
    }
  }
}
