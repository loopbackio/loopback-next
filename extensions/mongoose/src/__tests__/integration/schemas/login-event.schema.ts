// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/mongoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ObjectId} from 'mongodb';
import {Document, Schema} from 'mongoose';
import {UserInterface} from './user.schema';

export interface LoginEventInterface {
  _user?: ObjectId | (Document & UserInterface);
}

const loginEventSchema = new Schema<LoginEventInterface>({
  _user: {type: Schema.Types.ObjectId, ref: 'User'},
});

export default loginEventSchema;
