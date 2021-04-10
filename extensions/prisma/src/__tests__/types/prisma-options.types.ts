import {PrismaOptions} from '../../';

// @ts-expect-error PrismaOptions should not allow logging integration and
// prisma client log config
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const invalidPrismaOptionsWithConfigandLoggingIntegration: PrismaOptions = {
  enableLoggingIntegration: true,
  prismaClient: {
    log: [],
  },
};
