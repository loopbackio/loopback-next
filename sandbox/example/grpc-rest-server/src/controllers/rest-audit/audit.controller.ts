import {
    repository
  } from '@loopback/repository';
  import {getModelSchemaRef, post, requestBody} from '@loopback/rest';
  import {
    CONTENT_TYPE,
    OPERATION_SECURITY_SPEC,
    STATUS_CODE,
  } from '@sourceloop/core';

  import {AuditLog} from '../../models';
  import {AuditLogRepository} from '../../repositories';

  const basePath = '/audit-logs';

  export class AuditController {
    constructor(
      @repository(AuditLogRepository)
      public auditLogRepository: AuditLogRepository,
    ) {}

    @post(basePath, {
      security: OPERATION_SECURITY_SPEC,
      responses: {
        [STATUS_CODE.OK]: {
          description: 'AuditLog model instance',
          content: {[CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(AuditLog)}},
        },
      },
    })
    async create(
      @requestBody({
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: getModelSchemaRef(AuditLog, {
              title: 'NewAuditLog',
              exclude: ['id'],
            }),
          },
        },
      })
      auditLog: Omit<AuditLog, 'id'>,
    ): Promise<AuditLog> {
      return this.auditLogRepository.create(auditLog);
    }
  }
