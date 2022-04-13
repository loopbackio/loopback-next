// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Injection, ResolutionSession} from '@loopback/core';
import {TypeOrmBindings} from './typeorm.keys';

export namespace typeorm {
  export function repository(entity: Function, connectionName?: string) {
    return inject(
      '',
      {decorator: '@typeorm.repository'},
      async (
        ctx: Context,
        injection: Readonly<Injection>,
        session: ResolutionSession,
      ) => {
        const conn = await getConnection(ctx, connectionName);
        return conn.getRepository(entity);
      },
    );
  }
}

/**
 * Get a connection by name
 * @param ctx - Context object
 * @param connectionName - Optional connection name
 */
async function getConnection(ctx: Context, connectionName?: string) {
  const manager = await ctx.get(TypeOrmBindings.MANAGER);
  return manager.get(connectionName);
}
