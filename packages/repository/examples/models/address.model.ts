// Copyright The LoopBack Authors 2018,2021. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ValueObject} from '../..';

export class Address extends ValueObject {
  street: string;
  city: string;
  zipCode: string;
  state: string;
}
