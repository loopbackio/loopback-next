// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {StatusController} from 'component-controller';
import {LogController} from './LogController';

import {LogEntry, LogEntryRepository} from './LogModel';
import {TodoItem, TodoItemRepository} from 'component-model';
import {MemoryConnector} from './MemoryConnector';

exports.StatusController = StatusController;
exports.LogController = LogController;

exports.LogEntry = LogEntry;
exports.LogEntryRepository = LogEntryRepository;
exports.TodoItem = TodoItem;
exports.TodoItemRepository = TodoItemRepository;

const db = new MemoryConnector();
exports.dataSources = {db};

exports.models = {
  LogEntry,
  LogEntryRepository: LogEntryRepository.create(db),

  TodoItem,
  TodoItemRepository: TodoItemRepository.create(db),
};

// NOTE: in real world apps, the registry of repository instances should
// probably contain factory functions instead of shared instances, e.g.
//   ctx => new LogEntryRepository.create(db);
// Even better, we should use DependencyInjection to inject
// XyzRepository instance to controller constructors
//
// class TodoController {
//   constructor(@inject(LogEntryRepository) private readonly _logRepository: LogEntryRepository) {}
// }
