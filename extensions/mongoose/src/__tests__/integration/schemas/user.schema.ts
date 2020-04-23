// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/mongoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Schema} from 'mongoose';

export interface UserInterface {
  firstName: string;
  lastName: string;
}

const userSchema = new Schema<UserInterface>({
  firstName: {type: String},
  lastName: {type: String},
});

export default userSchema;
