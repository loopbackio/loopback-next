// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 discover integration model discovery generates all models without prompts using --all --dataSource 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Schema extends Entity {
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Schema>) {
    super(data);
  }
}

export interface SchemaRelations {
  // describe navigational properties here
}

export type SchemaWithRelations = Schema & SchemaRelations;

`;


exports[`lb4 discover integration model discovery generates all models without prompts using --all --dataSource 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class View extends Entity {
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<View>) {
    super(data);
  }
}

export interface ViewRelations {
  // describe navigational properties here
}

export type ViewWithRelations = View & ViewRelations;

`;


exports[`lb4 discover integration model discovery keeps model property names the same as the db column names 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Naming extends Entity {
  @property({
    type: 'number',
    id: 1,
    required: true,
  })
  ID: number;

  @property({
    type: 'number',
  })
  snake_case?: number;

  @property({
    type: 'boolean',
  })
  lowercase?: boolean;

  @property({
    type: 'number',
  })
  camelCase?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Naming>) {
    super(data);
  }
}

export interface NamingRelations {
  // describe navigational properties here
}

export type NamingWithRelations = Naming & NamingRelations;

`;


exports[`lb4 discover integration model discovery uses a different --outDir if provided 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Test extends Entity {
  @property({
    type: 'date',
  })
  dateTest?: string;

  @property({
    type: 'number',
  })
  numberTest?: number;

  @property({
    type: 'string',
  })
  stringTest?: string;

  @property({
    type: 'boolean',
  })
  booleanText?: boolean;

  @property({
    type: 'number',
    required: true,
    scale: 0,
    id: 1,
  })
  id: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Test>) {
    super(data);
  }
}

export interface TestRelations {
  // describe navigational properties here
}

export type TestWithRelations = Test & TestRelations;

`;
