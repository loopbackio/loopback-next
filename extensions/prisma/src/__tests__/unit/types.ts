// Copyright The LoopBack Authors 2021. All Rights Reserved.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Prisma} from '.prisma/client';
import {PrismaOptions} from '../../types';

const prismaLogType: (Prisma.LogLevel | Prisma.LogDefinition)[] = [];

// @ts-expect-error: Custom `PrismaClient` log config cannot be set alongside `enableLoggingIntegration`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const invalidPrismaLogConfig: PrismaOptions = {
  enableLoggingIntegration: true,
  prismaClient: {
    log: prismaLogType,
  },
};
