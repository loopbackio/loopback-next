import * as timestamp_pb from "./timestamp.proto";
export namespace Audit {
  /**
   * @interface Audit.Service
   * @author Jonathan Casarrubias <t: johncasarrubias>
   * @license MIT
   * @description Audit interface that provides types
   * for methods from the given gRPC Audit Service.
   */
  export interface Service {
    /**
     * @method Audit.Service.create
     * @author Jonathan Casarrubias <t: johncasarrubias>
     * @license MIT
     * @description Audit method declaration
     * from the given gRPC Audit service.
     */
    create(request: auditLog): Empty;
  }
  /**
   * @namespace Audit.Create
   * @author Jonathan Casarrubias <t: johncasarrubias>
   * @license MIT
   * @description Audit method configuration
   * from the given gRPC Audit service.
   */
  export namespace Create {
    export const PROTO_NAME: string = 'audit.proto';
    export const PROTO_PACKAGE: string = 'auditpackage';
    export const SERVICE_NAME: string = 'Audit';
    export const METHOD_NAME: string = 'Create';
    export const REQUEST_STREAM: boolean = false;
    export const RESPONSE_STREAM: boolean = false;
  }
}
/**
 * @interface Empty
 * @author Jonathan Casarrubias <t: johncasarrubias>
 * @license MIT
 * @description Empty interface that provides properties
 * and typings from the given gRPC Empty Message.
 */
export interface Empty {
}
/**
 * @interface auditLog
 * @author Jonathan Casarrubias <t: johncasarrubias>
 * @license MIT
 * @description auditLog interface that provides properties
 * and typings from the given gRPC auditLog Message.
 */
export interface auditLog {
  id: string;
  action: number;
  hasActedat(): boolean;
  clearActedat(): void;
  actedat?: timestamp_pb.Timestamp;
  actedon: string;
  actionkey: string;
  entityid: string;
  actor: string;
  before: string;
  after: string;
  actiongroup: string;
}
/**
 * @enum Action
 * @author Jonathan Casarrubias <t: johncasarrubias>
 * @license MIT
 * @description Action enum declaration that
 * provides values from the given gRPC Action Enum.
 */
export enum Action {
  INSERT_ONE = 0,
  INSERT_MANY = 1,
  UPDATE_ONE = 2,
  UPDATE_MANY = 3,
  DELETE_ONE = 4,
  DELETE_MANY = 5,
}
