// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MySqlConn} from './mysqlconn';
import {DataSource} from '@loopback/repository';
const mysqlCreds = require('./mysql.json');

export class MySqlDs implements DataSource {
  name: 'mysqlDs';
  connector: MySqlConn;
  settings: Object;

  constructor() {
    this.settings = mysqlCreds;
    this.connector = new MySqlConn(this.settings);
  }
}
