// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingAddress,
  MetadataInspector,
  MetadataMap,
  MethodDecoratorFactory,
} from '@loopback/context';
import {AuthorizationBindings} from '../keys';
import {
  AUTHENTICATED,
  AuthorizationMetadata,
  EVERYONE,
  UNAUTHENTICATED,
  Voter,
} from '../types';

export class AuthorizeMethodDecoratorFactory extends MethodDecoratorFactory<
  AuthorizationMetadata
> {
  protected mergeWithOwn(
    ownMetadata: MetadataMap<AuthorizationMetadata>,
    target: Object,
    methodName?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    ownMetadata = ownMetadata || {};
    let methodMeta = ownMetadata[methodName!];
    if (!methodMeta) {
      methodMeta = {};
      ownMetadata[methodName!] = methodMeta;
    }
    if (this.spec.allowedRoles) {
      methodMeta.allowedRoles = this.merge(
        methodMeta.allowedRoles,
        this.spec.allowedRoles,
      );
    }
    if (this.spec.deniedRoles) {
      methodMeta.deniedRoles = this.merge(
        methodMeta.deniedRoles,
        this.spec.deniedRoles,
      );
    }
    if (this.spec.scopes) {
      methodMeta.scopes = this.merge(methodMeta.scopes, this.spec.scopes);
    }
    if (this.spec.voters) {
      methodMeta.voters = this.merge(methodMeta.voters, this.spec.voters);
    }

    if (this.spec.resource) {
      methodMeta.resource = this.spec.resource;
    }

    return ownMetadata;
  }

  private merge<T>(src?: T[], target?: T[]): T[] {
    const list: T[] = [];
    const set = new Set<T>(src || []);
    if (target) {
      for (const i of target) {
        set.add(i);
      }
    }
    for (const i of set.values()) list.push(i);
    return list;
  }
}
/**
 * Decorator `@authorize` to mark methods that require authorization
 *
 * @param spec Authorization metadata
 */
export function authorize(spec: AuthorizationMetadata) {
  return AuthorizeMethodDecoratorFactory.createDecorator(
    AuthorizationBindings.METADATA,
    spec,
  );
}

export namespace authorize {
  /**
   * Shortcut to configure allowed roles
   * @param roles
   */
  export const allow = (...roles: string[]) => authorize({allowedRoles: roles});
  /**
   * Shortcut to configure denied roles
   * @param roles
   */
  export const deny = (...roles: string[]) => authorize({deniedRoles: roles});
  /**
   * Shortcut to specify access scopes
   * @param scopes
   */
  export const scope = (...scopes: string[]) => authorize({scopes});

  /**
   * Shortcut to configure voters
   * @param voters
   */
  export const vote = (...voters: (Voter | BindingAddress<Voter>)[]) =>
    authorize({voters});

  /**
   * Allows all
   */
  export const allowAll = () => allow(EVERYONE);

  /**
   * Allow all but the given roles
   * @param roles
   */
  export const allowAllExcept = (...roles: string[]) =>
    authorize({
      deniedRoles: roles,
      allowedRoles: [EVERYONE],
    });

  /**
   * Deny all
   */
  export const denyAll = () => deny(EVERYONE);

  /**
   * Deny all but the given roles
   * @param roles
   */
  export const denyAllExcept = (...roles: string[]) =>
    authorize({
      allowedRoles: roles,
      deniedRoles: [EVERYONE],
    });

  /**
   * Allow authenticated users
   */
  export const allowAuthenticated = () => allow(AUTHENTICATED);
  /**
   * Deny unauthenticated users
   */
  export const denyUnauthenticated = () => deny(UNAUTHENTICATED);
}

/**
 * Fetch authorization metadata stored by `@authorize` decorator.
 *
 * @param target Target object/class
 * @param methodName Target method
 */
export function getAuthorizeMetadata(
  target: object,
  methodName: string,
): AuthorizationMetadata | undefined {
  if (typeof target === 'function') {
    target = target.prototype;
  }
  return MetadataInspector.getMethodMetadata<AuthorizationMetadata>(
    AuthorizationBindings.METADATA,
    target,
    methodName,
  );
}
