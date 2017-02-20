// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ModelRepository, DataAccessConnector} from 'model';

export class LogEntry {
  public message: string;
  public timestamp: number;

  public constructor(data?: Partial<LogEntry>) {
    Object.assign(this, data);
  }

  public toObject(): Object {
    return Object.assign({}, this);
  }
}

export class LogEntryRepository extends ModelRepository<LogEntry> {
  public static create(connector: DataAccessConnector): LogEntryRepository {
    return new LogEntryRepository(LogEntry, LogEntry.name, connector);
  }
}
