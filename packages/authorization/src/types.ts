// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingAddress, InvocationContext} from '@loopback/context';

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

  // organization/realm/domain/tenant
  // team/group

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [attribute: string]: any;
}

/**
 * Represent a group of principals that have the same authority. There are two
 * types of roles:
 *
 * - explicit
 * - implicit
 *
 */
export interface Role {
  /**
   * Name/id
   */
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [attribute: string]: any;
}

/**
 * `Subject` represents both security state and operations for a single
 * application user.
 *
 * Such operations include:
 * - authentication (login)
 * - authorization (access control)
 * - session access
 * - logout
 */
export interface Subject {
  principals: Principal[];
  roles: Role[];
  scopes: string[];
}

/**
 * `Permission` defines an action/access against a protected resource. It's
 * the `what` for authorization.
 *
 * There are three levels of permissions
 *
 * - Resource level (Order, User)
 * - Instance level (Order-0001, User-1001)
 * - Property level (User-0001.email)
 *
 * @example
 * - create a user
 * - read email of a user
 * - change email of a user
 * - cancel an order
 */
export interface Permission {
  /**
   * Action or access of a protected resources, such as `read`, `create`,
   * `update`, or `delete`
   */
  action: string;

  /**
   * Type of protected resource, such as `Order` or `Customer`
   */
  resourceType: string;
  /**
   * Identity of a protected resource instance, such as `order-0001` or
   * `customer-101`
   */
  resourceInstance?: string;
  /**
   * Property of a protected resource type/instance, such as `email`
   */
  resourceProperty?: string;
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
export type Authorizer =
  /**
   * @param context: Context information for authorization
   * @param metadata: Metadata representing requirements for authorization
   */
  (
    context: AuthorizationContext,
    metadata: AuthorizationMetadata,
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
