// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import path from 'path';
import {ConnectionOptions} from '../../../';
import {Book} from '../typeorm-entities/book.entity';

export const SqliteConnection: ConnectionOptions = {
  name: 'my-db',
  type: 'sqlite',
  database: path.join(__dirname, './mydb.sql'),
  entities: [Book],
  synchronize: true,
};
