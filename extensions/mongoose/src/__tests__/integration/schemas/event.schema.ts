// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/mongoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Document, Schema} from 'mongoose';

export interface EventInterface {
  createdAt: Date;
}

const eventSchema = new Schema<EventInterface>(
  {
    createdAt: {type: Date},
  },
  {
    discriminatorKey: 'eventType',
  },
);

eventSchema.pre<Document & EventInterface>('save', function () {
  // eslint-disable-next-line no-invalid-this
  this.createdAt = new Date();
});

export default eventSchema;
