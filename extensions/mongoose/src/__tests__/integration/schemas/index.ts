// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/mongoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {Document, Model} from 'mongoose';
import EventSchema, {EventInterface} from './event.schema';
import LoginEventSchema, {LoginEventInterface} from './login-event.schema';
import UserSchema, {UserInterface} from './user.schema';

export namespace Schemas {
  export const Event = EventSchema;
  export const LoginEvent = LoginEventSchema;
  export const User = UserSchema;
}

export namespace Models {
  export type Event = Model<Document & EventInterface>;
  export type LoginEvent = Model<Document & LoginEventInterface>;
  export type User = Model<Document & UserInterface>;
}

export namespace BindingKeys {
  export namespace Connection1 {
    export const Event = BindingKey.create<Models.Event>(
      'typegoose.models.conn1.Event',
    );
    export const LoginEvent = BindingKey.create<Models.LoginEvent>(
      'typegoose.models.conn1.LoginEvent',
    );
    export const User = BindingKey.create<Models.User>(
      'typegoose.models.conn1.User',
    );
  }

  export namespace Connection2 {
    export const Event = BindingKey.create<Models.Event>(
      'typegoose.models.conn2.Event',
    );
    export const LoginEvent = BindingKey.create<Models.LoginEvent>(
      'typegoose.models.conn2.LoginEvent',
    );
    export const User = BindingKey.create<Models.User>(
      'typegoose.models.conn2.User',
    );
  }
}
