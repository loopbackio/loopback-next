// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {property} from '../../../..';
import {BadCyclicY} from './cyclic-y.model';

export class BadCyclicX {
  @property.array(BadCyclicY)
  cyclicProp: BadCyclicY[];
}
