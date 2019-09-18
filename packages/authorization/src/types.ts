// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingAddress, InvocationContext} from '@loopback/context';
import {Principal, Role} from '@loopback/security';

/**
 * Built-in roles
 */
export const EVERYONE = '$everyone';
export const AUTHENTICATED = '$authenticated';
export const UNAUTHENTICATED = '$unauthenticated';
export const ANONYMOUS = '$anonymous';

/**
 * Decisions for authorization
 */
export enum AuthorizationDecision {
  /**
   * Access allowed
   */
  ALLOW = 'Allow',
  /**
   * Access denied
   */
  DENY = 'Deny',
  /**
   * No decision
   */
  ABSTAIN = 'Abstain',
}

/**
 * Authorization metadata supplied via `@authorize` decorator
 */
export interface AuthorizationMetadata {
  /**
   * Roles that are allowed access
   */
  allowedRoles?: string[];
  /**
   * Roles that are denied access
   */
  deniedRoles?: string[];

  /**
   * Voters that help make the authorization decision
   */
  voters?: (Authorizer | BindingAddress<Authorizer>)[];

  /**
   * Name of the resource, default to the method name
   */
  resource?: string;
  /**
   * Define the access scopes
   */
  scopes?: string[];
  /**
   * A flag to skip authorization
   */
  skip?: boolean;
}

/**
 * Request context for authorization
 */
export interface AuthorizationContext {
  /**
   * An array of principals identified for the request - it should come from
   * authentication
   */
  principals: Principal[];
  /**
   * An array of roles for principals
   */
  roles: Role[];
  /**
   * An array of scopes representing granted permissions - usually come from
   * access tokens
   */
  scopes: string[];
  /**
   * An name for the target resource to be accessed, such as
   * `OrderController.prototype.cancelOrder`
   */
  resource: string;

  /**
   * Context for the invocation
   */
  invocationContext: InvocationContext;
}

/**
 * A function to decide if access to the target should be allowed or denied
 */
export type Authorizer<
  T extends AuthorizationMetadata = AuthorizationMetadata
> =
  /**
   * @param context: Context information for authorization
   * @param metadata: Metadata representing requirements for authorization
   */
  (
    context: AuthorizationContext,
    metadata: T,
  ) => Promise<AuthorizationDecision>;

/**
 * Inspired by https://github.com/casbin/node-casbin
 */
export interface AuthorizationRequest {
  /**
   * The domain (realm/tenant)
   */
  domain?: string;
  /**
   * The requestor that wants to access a resource.
   */
  subject: string;
  /**
   * The resource that is going to be accessed.
   */
  object: string;
  /**
   * The operation that the requestor performs on the resource.
   */
  action: string;
}

/**
 * An enforcer of authorization policies
 */
export interface Enforcer {
  /**
   * Extract the request from authorization context
   * @param authorizationContext
   */
  buildRequest(
    authorizationContext: AuthorizationContext,
  ): Promise<AuthorizationRequest>;

  /**
   * Decide if the request can be granted access
   * @param request
   */
  enforce(request: AuthorizationRequest): Promise<AuthorizationDecision>;
}

/**
 * The custom error class that describes the error thrown by
 * the authorization module.
 * Should be extracted to the common layer shared by authentication
 * and authorization.
 */
export class AuthorizationError extends Error {
  /**
   * Machine readable code, can be understood by any clients
   */
  code?: string;
  /**
   * The status code for HTTP requests
   */
  statusCode?: number;
}

export interface AuthorizationOptions {
  /**
   * Default decision if all authorizers vote for ABSTAIN
   * If not set, default to `AuthorizationDecision.DENY`
   */
  defaultDecision?: AuthorizationDecision.DENY | AuthorizationDecision.ALLOW;
  /**
   * Controls if Allow/Deny vote takes precedence and override other votes.
   * If not set, default to `AuthorizationDecision.DENY`.
   *
   * Once a vote matches the `precedence`, it becomes the final decision. The
   * rest of votes will be skipped.
   */
  precedence?: AuthorizationDecision.DENY | AuthorizationDecision.ALLOW;
  /**
   * Default authorization metadata if a method is not decorated with `@authorize`.
   * If not set, no authorization will be enforced for those methods that are
   * not associated with authorization metadata.
   */
  defaultMetadata?: AuthorizationMetadata;
}
