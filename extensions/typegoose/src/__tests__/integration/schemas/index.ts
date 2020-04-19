// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {ReturnModelType} from '@typegoose/typegoose';
import EventSchema from './event.schema';
import LoginEventSchema from './login-event.schema';
import UserSchema from './user.schema';

export namespace Schemas {
  export const Event = EventSchema;
  export const LoginEvent = LoginEventSchema;
  export const User = UserSchema;
}

export namespace Models {
  export type Event = ReturnModelType<typeof EventSchema>;
  export type LoginEvent = ReturnModelType<typeof LoginEventSchema>;
  export type User = ReturnModelType<typeof UserSchema>;
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
