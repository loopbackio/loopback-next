import { CrudRepositoryImpl } from '@loopback/repository';
import { MySqlDs } from './datasources/mysqlds';
import { Account } from './models/Account';


export class AccountRepository extends CrudRepositoryImpl<Account, string> {
  constructor() {
    const ds = new MySqlDs();
    super(ds, Account);
  }
}
