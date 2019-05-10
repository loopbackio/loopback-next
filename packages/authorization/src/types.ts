// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingAddress, Context, InvocationContext} from '@loopback/context';

/**
 * Built-in roles
 */
export const EVERYONE = '$everyone';
export const AUTHENTICATED = '$authenticated';
export const UNAUTHENTICATED = '$unauthenticated';
export const ANONYMOUS = '$anonymous';

/**
 * Voting decision for the authorization decision
 */
export enum VotingDecision {
  ALLOW = 'Allow',
  DENY = 'Deny',
  ABSTAIN = 'Abstain',
}

/**
 * A voter function
 */
export interface Voter {
  (ctx: Context): Promise<VotingDecision>;
}

/**
 * Authorization metadata stored via Reflection API
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
  voters?: (Voter | BindingAddress<Voter>)[];

  /**
   * Name of the resource, default to the method name
   */
  resource?: string;
  /**
   * Define the access scopes
   */
  scopes?: string[];
}

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
 * Represent a user, an application, or a device
 */
export interface Principal {
  /**
   * Name/id
   */
  name: string;
  /**
   * Type - user/application/device etc
   */
  type: string;
  // tslint:disable-next-line:no-any
  [attribute: string]: any;
}

/**
 * Represent a group of principals that have the same responsibility
 */
export interface Role {
  /**
   * Name/id
   */
  name: string;
  // tslint:disable-next-line:no-any
  [attribute: string]: any;
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
export interface AuthorizeFn {
  /**
   * @param request: Context information for authorization
   * @param metadata: Metadata representing requirements for authorization
   */
  (request: AuthorizationContext, metadata: AuthorizationMetadata): Promise<
    AuthorizationDecision
  >;
}

/**
 * Inspired by https://github.com/casbin/node-casbin
 */
export interface AuthorizationRequest {
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
