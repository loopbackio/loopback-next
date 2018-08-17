// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {property} from '../../../..';
import {BadCyclicX} from './cyclic-x.model';

export class BadCyclicY {
  @property.array(BadCyclicX)
  cyclicProp: BadCyclicX[];
}
