// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`cache-generator basic cache generates all files 1`] = `
export * from './cache.model';

`;


exports[`cache-generator basic cache generates all files 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Cache extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'any',
    required: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;

  @property({
    type: 'number',
    required: true,
  })
  ttl: number;

  constructor(data?: Partial<Cache>) {
    super(data);
  }
}

export interface CacheRelations {
  // describe navigational properties here
}

export type CacheWithRelations = Cache & CacheRelations;

`;


exports[`cache-generator basic cache generates all files 3`] = `
export * from './cache.repository';

`;


exports[`cache-generator basic cache generates all files 4`] = `
import {inject} from '@loopback/core';
import {DefaultKeyValueRepository} from '@loopback/repository';
import {} from '../datasources';
import {Cache} from '../models';

export class CacheRepository extends DefaultKeyValueRepository<Cache> {
  constructor(@inject('datasources.') dataSource: ) {
    super(Cache, dataSource);
  }
}

`;


exports[`cache-generator basic cache generates all files 5`] = `
export * from './cache-strategy.provider';

`;


exports[`cache-generator basic cache generates all files 6`] = `
import {inject, Provider, ValueOrPromise} from '@loopback/core';
import {repository} from '@loopback/repository';
import {CacheBindings, CacheMetadata, CacheStrategy} from 'loopback-api-cache';
import {Cache} from '../models';
import {CacheRepository} from '../repositories';

export class CacheStrategyProvider
  implements Provider<CacheStrategy | undefined>
{
  constructor(
    @inject(CacheBindings.METADATA)
    private metadata: CacheMetadata,
    @repository(CacheRepository) protected cacheRepo: CacheRepository,
  ) {}

  value(): ValueOrPromise<CacheStrategy | undefined> {
    if (!this.metadata) {
      return undefined;
    }

    return {
      check: (path: string) =>
        this.cacheRepo.get(path).catch(err => {
          console.error(err);
          return undefined;
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: async (path: string, result: any) => {
        const cache = new Cache({
          id: result.id,
          data: result,
          ttl: this.metadata.ttl,
        });
        // Defaults to ttl value of 60 seconds
        this.cacheRepo.set(path, cache, {ttl: 60000}).catch(err => {
          console.error(err);
        });
      },
    };
  }
}

`;
