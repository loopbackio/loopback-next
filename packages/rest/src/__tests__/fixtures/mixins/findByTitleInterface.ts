// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Model} from '@loopback/repository';

export interface FindByTitleInterface<M extends Model> {
  findByTitle(title: string): Promise<M[]>;
}
