// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {SchemaObject} from '@loopback/openapi-v3';
import {
  belongsTo,
  Entity,
  Filter,
  hasMany,
  hasOne,
  model,
  property,
} from '@loopback/repository';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  sinon,
} from '@loopback/testlab';
import {get, param, RestApplication} from '../../..';

describe('Coercion', () => {
  let app: RestApplication;
  let client: Client;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let spy: sinon.SinonSpy<[any], any>;

  before(givenAClient);

  after(async () => {
    await app.stop();
  });

  afterEach(() => {
    if (spy) spy.restore();
  });

  /* --------- schema defined for object query ---------- */
  const filterSchema: SchemaObject = {
    type: 'object',
    title: 'filter',
    properties: {
      where: {
        type: 'object',
        properties: {
          id: {type: 'number'},
          name: {type: 'string'},
          active: {type: 'boolean'},
        },
      },
    },
  };
  /* ----------------------- end ----------------------- */

  /* --------- models defined for nested inclusion query -------- */
  @model()
  class Todo extends Entity {
    @property({
      type: 'number',
      id: true,
      generated: false,
    })
    id: number;

    @belongsTo(() => TodoList)
    todoListId: number;
  }

  @model()
  class TodoListImage extends Entity {
    @property({
      type: 'number',
      id: true,
      generated: false,
    })
    id: number;

    @belongsTo(() => TodoList)
    todoListId: number;

    @property({
      required: true,
    })
    value: string;
  }

  @model()
  class TodoList extends Entity {
    @property({
      type: 'number',
      id: true,
      generated: false,
    })
    id: number;

    @hasMany(() => Todo)
    todos: Todo[];

    @hasOne(() => TodoListImage)
    image: TodoListImage;
  }
  /* ---------------------------- end --------------------------- */

  class MyController {
    @get('/create-number-from-path/{num}')
    createNumberFromPath(@param.path.number('num') num: number) {
      return num;
    }

    @get('/create-number-from-query')
    createNumberFromQuery(@param.query.number('num') num: number) {
      return num;
    }

    @get('/create-number-from-header')
    createNumberFromHeader(@param.header.number('num') num: number) {
      return num;
    }

    @get('/string-from-query')
    getStringFromQuery(@param.query.string('where') where: string) {
      return where;
    }

    @get('/object-from-query')
    getObjectFromQuery(
      @param.query.object('filter', filterSchema) filter: object,
    ) {
      return filter;
    }

    @get('/random-object-from-query')
    getRandomObjectFromQuery(@param.query.object('filter') filter: object) {
      return filter;
    }

    @get('/nested-inclusion-from-query')
    nestedInclusionFromQuery(
      @param.filter(Todo)
      filter: Filter<Todo>,
    ) {
      return filter;
    }

    @get('/array-parameters-from-query')
    getArrayFromQuery(
      @param.array('stringArray', 'query', {type: 'string'})
      stringArray: string[],
    ) {
      return stringArray;
    }
  }

  it('coerces parameter in path from string to number', async () => {
    spy = sinon.spy(MyController.prototype, 'createNumberFromPath');
    await client.get('/create-number-from-path/100').expect(200);
    sinon.assert.calledWithExactly(spy, 100);
  });

  it('coerces parameter in header from string to number', async () => {
    spy = sinon.spy(MyController.prototype, 'createNumberFromHeader');
    await client.get('/create-number-from-header').set({num: 100});
    sinon.assert.calledWithExactly(spy, 100);
  });

  it('coerces parameter in query from string to number', async () => {
    spy = sinon.spy(MyController.prototype, 'createNumberFromQuery');
    await client.get('/create-number-from-query').query({num: 100}).expect(200);
    sinon.assert.calledWithExactly(spy, 100);
  });

  it('coerces parameter in query from JSON to object', async () => {
    spy = sinon.spy(MyController.prototype, 'getObjectFromQuery');
    await client
      .get('/object-from-query')
      .query({filter: '{"where":{"id":1,"name":"Pen", "active": true}}'})
      .expect(200);
    sinon.assert.calledWithExactly(spy, {
      where: {id: 1, name: 'Pen', active: true},
    });
  });

  it('coerces parameter in query from nested keys to object', async () => {
    // Notice that numeric and boolean values are coerced to their own types
    // because the schema is provided.
    spy = sinon.spy(MyController.prototype, 'getObjectFromQuery');
    await client
      .get('/object-from-query')
      .query({
        'filter[where][id]': 1,
        'filter[where][name]': 'Pen',
        'filter[where][active]': true,
      })
      .expect(200);
    sinon.assert.calledWithExactly(spy, {
      where: {
        id: 1,
        name: 'Pen',
        active: true,
      },
    });
  });

  it('coerces parameter in query from nested keys to object - no schema', async () => {
    // Notice that numeric and boolean values are converted to strings.
    // This is because all values are encoded as strings on URL queries
    // and we did not specify any schema in @param.query.object() decorator.
    spy = sinon.spy(MyController.prototype, 'getRandomObjectFromQuery');
    await client
      .get('/random-object-from-query')
      .query({
        'filter[where][id]': 1,
        'filter[where][name]': 'Pen',
        'filter[where][active]': true,
      })
      .expect(200);
    sinon.assert.calledWithExactly(spy, {
      where: {
        id: '1',
        name: 'Pen',
        active: 'true',
      },
    });
  });

  it('rejects object value constructed by qs for string parameter', async () => {
    await client
      .get('/string-from-query')
      .query({
        'where[id]': 1,
        'where[name]': 'Pen',
        'where[active]': true,
      })
      .expect(400);
  });

  it('allows nested inclusion filter', async () => {
    spy = sinon.spy(MyController.prototype, 'nestedInclusionFromQuery');
    const inclusionFilter = {
      include: [
        {
          relation: 'todoList',
          scope: {
            include: [
              {
                relation: 'image',
                scope: {
                  fields: {value: false},
                },
              },
            ],
          },
        },
      ],
    };
    const encodedFilter = encodeURIComponent(JSON.stringify(inclusionFilter));
    await client
      .get(`/nested-inclusion-from-query?filter=${encodedFilter}`)
      .expect(200);
    sinon.assert.calledWithExactly(spy, {...inclusionFilter});
  });

  it('returns AJV validation errors in error details', async () => {
    const filter = {
      where: 'string-instead-of-object',
    };
    const response = await client
      .get(`/nested-inclusion-from-query`)
      .query({filter: JSON.stringify(filter)})
      .expect(400);

    expect(response.body.error).to.containDeep({
      code: 'INVALID_PARAMETER_VALUE',
      details: [
        {
          code: 'type',
          info: {
            type: 'object',
          },
          message: 'must be object',
          path: '/where',
        },
      ],
    });

    expect(response.body.error.message).to.match(
      /Invalid data.* for parameter "filter"/,
    );
  });

  describe('coerces array parameters', () => {
    it('coerces a single value into an array with one item', async () => {
      const response = await client
        .get('/array-parameters-from-query')
        .query({
          stringArray: 'hello',
        })
        .expect(200);

      expect(response.body).to.eql(['hello']);
    });

    it('preserves array values as arrays', async () => {
      const response = await client
        .get('/array-parameters-from-query')
        .query({
          stringArray: ['hello', 'loopback', 'world'],
        })
        .expect(200);

      expect(response.body).to.eql(['hello', 'loopback', 'world']);
    });
  });

  async function givenAClient() {
    app = new RestApplication({rest: givenHttpServerConfig()});
    app.controller(MyController);
    await app.start();
    client = createRestAppClient(app);
  }
});
