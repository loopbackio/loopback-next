import {Entity, model} from '@loopback/repository';

export const eventTableName = 'tbl_event';
@model({
  name: eventTableName,
})
export class Event extends Entity {
  // No properties are needed, This model is just used for testing the table names

  constructor(data?: Partial<Event>) {
    super(data);
  }
}

@model()
export class Box extends Entity {
  // No properties are needed, This model is just used for testing the table names

  constructor(data?: Partial<Box>) {
    super(data);
  }
}
