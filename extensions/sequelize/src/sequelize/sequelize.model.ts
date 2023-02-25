// Copyright LoopBack contributors 2022. All Rights Reserved.
// Node module: @loopback/sequelize
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject, Entity} from '@loopback/repository';
import {Model} from 'sequelize';

export class SequelizeModel extends Model implements Entity {
  getId() {
    // Method implementation not required as this class is just being used as type not a constructor
    return null;
  }
  getIdObject(): Object {
    // Method implementation not required as this class is just being used as type not a constructor
    return {};
  }
  toObject(_options?: AnyObject | undefined): Object {
    // Method implementation not required as this class is just being used as type not a constructor
    return {};
  }
}
