// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {StatusController} from 'component-controller';
import {LogController} from './LogController';

import {LogEntry, LogEntryRepository} from './LogModel';
import {TodoItem, TodoItemRepository} from 'component-model';
import {MemoryConnector} from './MemoryConnector';

import {Model, ModelRepository} from 'model';

exports.StatusController = StatusController;
exports.LogController = LogController;

exports.LogEntry = LogEntry;
exports.LogEntryRepository = LogEntryRepository;
exports.TodoItem = TodoItem;
exports.TodoItemRepository = TodoItemRepository;

const db = new MemoryConnector();
exports.dataSources = {db};

// FIXME: all these properties are of type "any" :(
// We need to find a way how to cast them to correct types
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

// Verify type checks using different base types

// In the app, both ModelRepository and LogEntryRepository are coming from the same package
const typed1: ModelRepository<Model> = exports.models.LogEntryRepository as LogEntryRepository;
const typed2: ModelRepository<LogEntry> = exports.models.LogEntryRepository as LogEntryRepository;

// Here, ModelRepository comes from a different package than TodoItemRepository
// Fortunatelly, TypeScript compares interfaces by content, not by reference
const typed3: ModelRepository<Model> = exports.models.TodoItemRepository as TodoItemRepository;
const typed4: ModelRepository<TodoItem> = exports.models.TodoItemRepository as TodoItemRepository;
