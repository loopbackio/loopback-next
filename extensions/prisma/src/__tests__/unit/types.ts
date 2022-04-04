// SPDX-FileCopyrightNotice: LoopBack Contributors
// SPDX-License-Identifier: MIT
// Node module: @loopback/prisma

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
