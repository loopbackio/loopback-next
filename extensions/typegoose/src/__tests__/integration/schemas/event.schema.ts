// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {modelOptions, pre, prop} from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    discriminatorKey: 'eventType',
  },
})
@pre<Event>('save', function () {
  // eslint-disable-next-line no-invalid-this
  this.createdAt = new Date();
})
export default class Event {
  @prop()
  createdAt: Date;
}
