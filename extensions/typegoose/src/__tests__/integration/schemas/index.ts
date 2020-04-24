// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {BindingKey, Context} from '@loopback/core';
import {ReturnModelType} from '@typegoose/typegoose';
import debugFactory from 'debug';
import {createConnection} from 'mongoose';
import {TypegooseBindings} from '../../../keys';
import EventSchema from './event.schema';
import LoginEventSchema from './login-event.schema';
import UserSchema from './user.schema';
const debug = debugFactory('loopback:typegoose:integration-test:setup');

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
      'typegoose-integration-text.models.conn1.Event',
    );
    export const LoginEvent = BindingKey.create<Models.LoginEvent>(
      'typegoose-integration-text.models.conn1.LoginEvent',
    );
    export const User = BindingKey.create<Models.User>(
      'typegoose-integration-text.models.conn1.User',
    );
  }

  export namespace Connection2 {
    export const Event = BindingKey.create<Models.Event>(
      'typegoose-integration-text.models.conn2.Event',
    );
    export const LoginEvent = BindingKey.create<Models.LoginEvent>(
      'typegoose-integration-text.models.conn2.LoginEvent',
    );
    export const User = BindingKey.create<Models.User>(
      'typegoose-integration-text.models.conn2.User',
    );
  }
}

export async function configureTypegoose(context: Context, uri: string) {
  debug('Creating mongoose connection');
  const connection = await createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  debug('Adding configuration');
  context.configure(TypegooseBindings.COMPONENT).to([
    {
      connection,
      schemas: [
        {schema: Schemas.Event, bindingKey: BindingKeys.Connection1.Event},
        {schema: Schemas.User, bindingKey: BindingKeys.Connection1.User},
      ],
      discriminators: [
        {
          schema: Schemas.LoginEvent,
          modelKey: BindingKeys.Connection1.Event,
          bindingKey: BindingKeys.Connection1.LoginEvent,
        },
      ],
    },
  ]);
}
