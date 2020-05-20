// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict'

import {Application} from "@loopback/core";

class MyUserIdentityService {
    constructor() {}
}

export const UserServiceBindingKey = 'user-identity-service';

export function addServices(app: Application) {
  app.bind(UserServiceBindingKey).toClass(MyUserIdentityService);
}
