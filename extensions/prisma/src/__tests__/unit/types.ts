import {PrismaOptions} from '../../types';

// @ts-expect-error: Custom `PrismaClient` log config cannot be set alongside `enableLoggingIntegration`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const invalidPrismaLogConfig: PrismaOptions = {
  enableLoggingIntegration: true,
  prismaClient: {
    log: [],
  },
};
