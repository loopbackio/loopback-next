import {inject, Provider, ValueOrPromise} from '@loopback/core';
import {repository} from '@loopback/repository';
import {CacheBindings, CacheMetadata, CacheStrategy} from 'loopback-api-cache';
import {Cache} from '../models';
import {CacheRepository} from '../repositories';

/**
 * Add custom logic for data Caching
 */
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
      // Returns cached value
      check: (path: string) =>
        this.cacheRepo.get(path).catch(err => {
          console.error(err);
          return undefined;
        }),
      // Set cache
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set: async (path: string, result: any) => {
        const cache = new Cache({
          id: result.id,
          data: result,
          ttl: this.metadata.ttl,
        });
        this.cacheRepo.set(path, cache, {ttl: 600000}).catch(err => {
          console.error(err);
        });
      },
    };
  }
}
