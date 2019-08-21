// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/security
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A symbol for stringified id of security related objects
 */
export const securityId = Symbol('securityId');

/**
 * Represent a user, an application, or a device
 */
export interface Principal {
  /**
   * Name/id
   */
  [securityId]: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [attribute: string]: any;
}

export class TypedPrincipal implements Principal {
  constructor(
    public readonly principal: Principal,
    public readonly type: string,
  ) {}
  get [securityId]() {
    return `${this.type}:${this.principal[securityId]}`;
  }
}

/**
 * The minimum set of attributes that describe a user.
 */
export interface UserProfile extends Principal {
  // `email` and `name` are added to be identical with the
  // current `UserProfile` being exported from `@loopback/authentication`
  email?: string;
  name?: string;
}

export interface Organization extends Principal {}

export interface Team extends Principal {}

export interface ClientApplication extends Principal {}

export interface Role extends Principal {
  name: string;
}

/**
 * Security attributes used to authenticate the subject. Such credentials
 * include passwords, Kerberos tickets, and public key certificates.
 */
export interface Credential {}

/**
 * `Permission` defines an action/access against a protected resource. It's
 * the `what` for security.
 *
 * There are three levels of permissions
 *
 * - Resource level (Order, User)
 * - Instance level (Order-0001, User-1001)
 * - Property level (User-0001.email)
 *
 * @example
 * - create a user (action: create, resource type: user)
 * - read email of a user (action: read, resource property: user.email)
 * - change email of a user (action: update, resource property: user.email)
 * - cancel an order (action: delete, resource type: order)
 */
export class Permission {
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
   * Property of a protected resource type/instance, such as `email`
   */
  resourceProperty?: string;
  /**
   * Identity of a protected resource instance, such as `order-0001` or
   * `customer-101`
   */
  resourceId?: string;

  get [securityId]() {
    const resIds: string[] = [];
    resIds.push(this.resourceType);
    if (this.resourceProperty) {
      resIds.push(this.resourceProperty);
    }
    const inst = this.resourceId ? `:${this.resourceId}` : '';

    return `${resIds.join('.')}:${this.action}${inst}`;
  }
}

/**
 * oAuth 2.0 scope
 */
export interface Scope extends Permission {
  name: string;
}

/**
 * `Subject` represents both security state and operations for a single
 * request. It's the `who` for security.
 *
 * Such operations include:
 * - authentication (login)
 * - authorization (access control)
 * - session access
 * - logout
 *
 */
export interface Subject {
  /**
   * An array of principals. It can include information about the current user,
   * the client application, and granted authorities.
   *
   * `Subject` represents both security state and operations for a single
   * application user.
   *
   * Such operations include:
   * - authentication (login)
   * - authorization (access control)
   * - session access
   * - logout
   */
  principals: Set<TypedPrincipal>;

  /**
   * An array of credentials, such as password, access token, or private/public
   * keys.
   */
  credentials: Set<Credential>;

  /**
   * An array of authorities granted by the user to the client application. One
   * example is {@link https://tools.ietf.org/html/rfc6749#section-3.3 | oAuth2 scopes).
   */
  authorities: Set<Permission>;
}

/**
 * Default implementation of `Subject`
 */
export class DefaultSubject implements Subject {
  readonly principals = new Set<TypedPrincipal>();
  readonly authorities = new Set<Permission>();
  readonly credentials = new Set<Credential>();

  addUser(...users: UserProfile[]) {
    for (const user of users) {
      this.principals.add(new TypedPrincipal(user, 'USER'));
    }
  }

  addApplication(app: ClientApplication) {
    this.principals.add(new TypedPrincipal(app, 'APPLICATION'));
  }

  addAuthority(...authorities: Permission[]) {
    for (const authority of authorities) {
      this.authorities.add(authority);
    }
  }

  addCredential(...credentials: Credential[]) {
    for (const credential of credentials) {
      this.credentials.add(credential);
    }
  }

  getPrincipal(type: string) {
    let principal: Principal | undefined;
    for (const p of this.principals) {
      if (p.type === type) {
        principal = p.principal;
        break;
      }
    }
    return principal;
  }

  get user() {
    return this.getPrincipal('USER') as UserProfile | undefined;
  }
}
