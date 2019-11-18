// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 model integration discovers a model from a datasource 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Test extends Entity {
  @property({
    type: 'Date',
  })
  dateTest?: Date;

  @property({
    type: 'Number',
  })
  numberTest?: Number;

  @property({
    type: 'String',
  })
  stringTest?: String;

  @property({
    type: 'Boolean',
  })
  booleanText?: Boolean;

  @property({
    type: 'Number',
    required: true,
    scale: 0,
    id: 1,
  })
  id: Number;


  constructor(data?: Partial<Test>) {
    super(data);
  }
}

export interface TestRelations {
  // describe navigational properties here
}

export type TestWithRelations = Test & TestRelations;

`;
