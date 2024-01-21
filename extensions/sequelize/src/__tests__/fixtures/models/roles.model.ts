import {Entity, model, property} from '@loopback/repository';

@model()
export class Roles extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
    postgresql: {
      dataType: 'varchar[]',
    },
  })
  permissions: string[];

  @property({
    type: 'string',
  })
  description?: string;

  constructor(data?: Partial<Roles>) {
    super(data);
  }
}

export interface RolesRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Roles & RolesRelations;
