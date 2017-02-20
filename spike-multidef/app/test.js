// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const chai = require('chai');
chai.use(require('dirty-chai'));
const expect = chai.expect;

const app = require('./');

describe('remoting metadata', () => {
  const inspectStringwise = require('metadata').inspectStringwise;
  const inspectSymbolwise = require('metadata').inspectSymbolwise;

  const TEST_CASES = {
    'indexed by string key': inspectStringwise,
    'indexed by Symbol key': inspectSymbolwise,
  };

  Object.keys(TEST_CASES).forEach(tc => {
    const inspect = TEST_CASES[tc];
    describe(tc, () => {
      it('recognizes app controller', () => {
        expect(inspect(app.LogController)).to.eql({
          version: '1.2.0',
          baseUrl: '/logs',
          methods: {
            getLogs: {
              http: { verb: 'get' },
              returns: { type: 'Array' },
            }
          },
        });
      });

      it('recognizes component controller', () => {
        expect(inspect(app.StatusController)).to.eql({
          version: '1.0.0',
          baseUrl: '/status',
          methods: {
            getStatus: {
               http: { verb: 'get' },
               // somehow, "design:returntype" is not defined when
               // the type is a custom/private constructor function
               // returns: { type: 'Status' },
            },
          },
        });
      });
    });
  });
});

describe('Model repository (inheritance)', () => {
  const OUR_MODEL_VERSION = '1.2.0';
  const COMPONENT_MODEL_VERSION = '1.0.0';
  const {
    LogEntry,
    LogEntryRepository,
    TodoItem,
    TodoItemRepository
  } = app.models;
  const ModelRepository = require('model').ModelRepository;

  it('allows different version of model and connector', () => {
    expect(app.dataSources.db.constructor.MODEL_VERSION).to.eql(OUR_MODEL_VERSION);

    expect(LogEntryRepository.constructor.MODEL_VERSION).to.eql(OUR_MODEL_VERSION);
    expect(LogEntryRepository.connector.constructor.MODEL_VERSION).to.eql(OUR_MODEL_VERSION);

    // Notice that the repository class uses type info from a different version of "model" package
    // than the connector it is attached to.
    expect(TodoItemRepository.constructor.MODEL_VERSION).to.eql(COMPONENT_MODEL_VERSION);
    expect(TodoItemRepository.connector.constructor.MODEL_VERSION).to.eql(OUR_MODEL_VERSION);
  });

  it('detects app\'s LogEntryRepository as ModelRepository', () => {
    expect(LogEntryRepository).to.be.instanceOf(ModelRepository);
  });

  it('detects components\'s TodoItemRepository as ModelRepository', () => {
    expect(TodoItemRepository).to.be.instanceOf(ModelRepository);
  })

  it('finds no instances in empty datasource (LogEntry)', () => {
    return LogEntryRepository.find().then(found => expect(found).to.be.empty());
  });

  it('finds no instances in empty datasource (TodoItem)', () => {
    return LogEntryRepository.find().then(found => expect(found).to.be.empty());
  });

  it('creates and finds model instances', () => {
    return LogEntryRepository.create({ message: 'hello', timestamp: Date.now() })
      .then(() => TodoItemRepository.create({ title: 'greet', done: true}))
      .then(() => Promise.all([LogEntryRepository.find(), TodoItemRepository.find()]))
      .then(results => {
        const logs = results[0] || [];
        const todos = results[1] || [];
        var prettify = it => it.message || it.title;

        expect(logs.map(prettify), 'LogEntry').to.eql(['hello']);
        expect(logs[0], 'LogEntry instance').to.be.instanceOf(LogEntry);

        expect(todos.map(prettify), 'TodoItem').to.eql(['greet']);
        expect(todos[0], 'TodoItem instance').to.be.instanceOf(TodoItem);
      });
  });
});
