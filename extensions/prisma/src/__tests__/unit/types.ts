import {Prisma} from '.prisma/client';
import {PrismaOptions} from '../../types';

let prismaLogType: (Prisma.LogLevel | Prisma.LogDefinition)[] = [];

// @ts-expect-error: Custom `PrismaClient` log config cannot be set alongside `enableLoggingIntegration`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const invalidPrismaLogConfig: PrismaOptions = {
  enableLoggingIntegration: true,
  prismaClient: {
    log: prismaLogType,
  },
};
