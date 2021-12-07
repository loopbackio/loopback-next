import { grpc } from "@loopback/grpc";
import { auditLog, Audit, Empty } from "./audit.proto";
import { AuditLogRepository } from "../../repositories";
import { repository } from "@loopback/repository";
import { AuditLog } from "../../models";
/**
 * @class AuditCtrl
 * @description Implements grpc proto service
 **/
export class AuditCtrl implements Audit.Service {
  constructor(
    @repository(AuditLogRepository)
    public auditLogRepository: AuditLogRepository,
  ) {}
  // Tell LoopBack that this is a Service RPC implementation
  @grpc(Audit.Create)
  create(request: auditLog): Empty {    
   return this.auditLogRepository.create(AuditLog);
  }
}

