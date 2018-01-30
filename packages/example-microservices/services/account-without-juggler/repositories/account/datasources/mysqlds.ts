import { MySqlConn } from './mysqlconn';
import { DataSource } from '@loopback/repository';
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

