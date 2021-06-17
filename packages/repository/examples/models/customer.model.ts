// Copyright The LoopBack Authors 2018,2021. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {model, Entity} from '../..';

@model(require('./customer.definition'))
export class Customer extends Entity {}
