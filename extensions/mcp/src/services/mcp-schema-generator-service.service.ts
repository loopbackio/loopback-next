import {BindingScope, inject, injectable} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {z, ZodRawShape} from 'zod';
import {extractParameterInfo} from '../utils';

@injectable({scope: BindingScope.SINGLETON})
export class McpSchemaGeneratorService {
  constructor(
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
  ) {}

  /**
   * Create Zod schema for a single parameter using LoopBack type string
   */
  createZodSchemaForParameterType(paramType: string) {
    switch (paramType) {
      case 'string':
        return z.string();
      case 'number':
        return z.number();
      case 'boolean':
        return z.boolean();
      case 'object':
        return z.object({}).passthrough();
      case 'array':
        return z.array(z.any());
      default:
        return z.any();
    }
  }

  /**
   * Generate tool schema using LoopBack metadata
   */
  generateToolSchemaFromLoopBack(
    options: {name: string; description: string; schema?: ZodRawShape},
    target: Object,
    methodName: string,
  ) {
    let schema = options.schema;

    if (!schema || Object.keys(schema).length === 0) {
      try {
        const {parameterNames, parameterOptional, parameterTypes} =
          extractParameterInfo(target, methodName);

        if (parameterNames.length > 0) {
          let combinedSchema = z.object({});

          parameterTypes.forEach((paramType, index) => {
            const zodSchema = this.createZodSchemaForParameterType(paramType);
            const paramName = parameterNames[index];
            const isOptional = parameterOptional[index];

            combinedSchema = combinedSchema.merge(
              z.object({
                [paramName]: isOptional ? zodSchema.optional() : zodSchema,
              }),
            );
          });

          schema = combinedSchema.shape;
        } else {
          schema = {};
        }
      } catch (error) {
        this.logger.warn(
          `Failed to generate schema for tool ${options.name} from LoopBack metadata:`,
          error,
        );
        schema = {};
      }
    } else {
      schema = schema ?? {};
    }

    return schema;
  }
}
