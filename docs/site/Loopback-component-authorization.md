---
lang: en
title: 'Authorization'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Loopback-component-authorization.html
---

## Overview

In every web application, we need to have a way to identify access rights of a
user for any resource, which is known as **Authorization**. This is a
minimalistic guide for creating such an implementation using Loopback component.
This can be part of your main REST Application project or can be created as a
Loopback extension for reuse in multiple projects. Latter is the better option
for obvious reasons - reusability.

{% include note.html content="
The LoopBack team is working on making authorization an out-of-the-box
feature in LoopBack 4. It is a work in progress and will soon be there. Until
then, this implementation guide can be followed.
" %}

## The requirement

1. Every protected API end point needs to be restricted by specific permissions.
2. API allows access only if logged in user has permission as per end point
   restrictions.
3. API throws **403 Forbidden** error if logged in user do not have sufficient
   permissions.
4. Publicly accessible APIs must be accessible regardless of user permissions.
5. Every user has a set of permissions. These permissions may be associated via
   role attached to the user or directly to the user.
6. A user can be provided additional permissions or denied some permissions over
   an above its role permissions. This is considered explicit allow/deny and
   always takes precedence while calculating permissions.

## Considerations

There are a few considerations that are taken into account before this
implementation can be done.

1. User authentication is already implemented. You can refer to the
   [@loopback/authentication](https://github.com/strongloop/loopback-next/tree/master/packages/authentication#loopbackauthentication)
   guide.
2. As part of authentication, client is sent back a token (JWT or similar) which
   client need to pass in every API request headers thereafter.
3. The authenticate action provider parses the token to return AuthResponse
   object.
4. AuthResponse contains the logged in user information including associated
   role details.

## The implementation

First, let's define the types needed for this.

{% include code-caption.html content="/src/authorization/types.ts" %}

```ts
import {PermissionKey} from './permission-key';

/**
 * Authorize action method interface
 */
export interface AuthorizeFn {
  // userPermissions - Array of permission keys granted to the user
  // This is actually a union of permissions picked up based on role
  // attached to the user and allowed permissions at specific user level
  (userPermissions: PermissionKey[]): Promise<boolean>;
}

/**
 * Authorization metadata interface for the method decorator
 */
export interface AuthorizationMetadata {
  // Array of permissions required at the method level.
  // User need to have at least one of these to access the API method.
  permissions: string[];
}

/**
 * User Permission model
 * used for explicit allow/deny any permission at user level
 */
export interface UserPermission {
  permission: PermissionKey;
  allowed: boolean;
}

/**
 * User permissions manipulation method interface.
 *
 * This is where we can add our business logic to read and
 * union permissions associated to user via role with
 * those associated directly to the user.
 *
 */
export interface UserPermissionsFn {
  (
    userPermissions: UserPermission[],
    rolePermissions: PermissionKey[],
  ): PermissionKey[];
}
```

We define four interfaces.

- **_AuthorizeFn_** - This is going to be the interface for authorization action
  business logic.
- **_AuthorizationMetadata_** - This interface represents the information to be
  passed via decorator for each individual controller method.
- **_UserPermission_** - This is the interface to be used for associating user
  level permissions. It is actually doing explicit allow/deny at user level,
  over and above role permissions.
- **_UserPermissionsFn_** - This is going to be the interface for user
  permissions manipulation, if required any.

The PermissionKey is an enum containing all possible permission keys. Here is a
sample.

{% include code-caption.html content="/src/authorization/permission-key.ts" %}

```ts
export const enum PermissionKey {
  // For accessing own (logged in user) profile
  ViewOwnUser = 'ViewOwnUser',
  // For accessing other users profile.
  ViewAnyUser = 'ViewAnyUser',
  // For creating a user
  CreateAnyUser = 'CreateAnyUser',
  // For updating own (logged in user) profile
  UpdateOwnUser = 'UpdateOwnUser',
  // For updating other users profile
  UpdateAnyUser = 'UpdateAnyUser',
  // For deleting a user
  DeleteAnyUser = 'DeleteAnyUser',

  // For accessing a role
  ViewRoles = 'ViewRoles',
  // For creating a role
  CreateRoles = 'CreateRoles',
  // For updating a role info
  UpdateRoles = 'UpdateRoles',
  // For removing a role
  DeleteRoles = 'DeleteRoles',
}
```

Next, we create the binding keys for each type and accessor key for method
decorator.

{% include code-caption.html content="/src/authorization/keys.ts" %}

```ts
import {BindingKey} from '@loopback/context';
import {MetadataAccessor} from '@loopback/metadata';
import {AuthorizeFn, AuthorizationMetadata, UserPermissionsFn} from './types';

/**
 * Binding keys used by this component.
 */
export namespace AuthorizationBindings {
  export const AUTHORIZE_ACTION = BindingKey.create<AuthorizeFn>(
    'userAuthorization.actions.authorize',
  );

  export const METADATA = BindingKey.create<AuthorizationMetadata | undefined>(
    'userAuthorization.operationMetadata',
  );

  export const USER_PERMISSIONS = BindingKey.create<UserPermissionsFn>(
    'userAuthorization.actions.userPermissions',
  );
}

/**
 * Metadata accessor key for authorize method decorator
 */
export const AUTHORIZATION_METADATA_ACCESSOR = MetadataAccessor.create<
  AuthorizationMetadata,
  MethodDecorator
>('userAuthorization.accessor.operationMetadata');
```

Now, we need to create three providers

- **_AuthorizationMetadataProvider_** - This will read the decorator metadata
  from the controller methods wherever the decorator is used.
- **_AuthorizeActionProvider_** - This holds the business logic for access
  validation of the user based upon access permissions allowed at method level
  via decorator metadata above.
- **_UserPermissionsProvider_** - This is where we can add our business logic to
  read and unify permissions associated to user via role, with those associated
  directly to the user. In our case, an explicit allow/deny at user level takes
  precendence over role permissions. But this business logic may vary
  apllication to application. So, feel free to customize.

{% include code-caption.html content="/src/authorization/providers/authorization-metadata.provider.ts" %}

```ts
import {
  Constructor,
  inject,
  MetadataInspector,
  Provider,
} from '@loopback/context';
import {CoreBindings} from '@loopback/core';

import {AUTHORIZATION_METADATA_ACCESSOR} from '../keys';
import {AuthorizationMetadata} from '../types';

export class AuthorizationMetadataProvider
  implements Provider<AuthorizationMetadata | undefined> {
  constructor(
    @inject(CoreBindings.CONTROLLER_CLASS)
    private readonly controllerClass: Constructor<{}>,
    @inject(CoreBindings.CONTROLLER_METHOD_NAME)
    private readonly methodName: string,
  ) {}

  value(): AuthorizationMetadata | undefined {
    return getAuthorizeMetadata(this.controllerClass, this.methodName);
  }
}

export function getAuthorizeMetadata(
  controllerClass: Constructor<{}>,
  methodName: string,
): AuthorizationMetadata | undefined {
  return MetadataInspector.getMethodMetadata<AuthorizationMetadata>(
    AUTHORIZATION_METADATA_ACCESSOR,
    controllerClass.prototype,
    methodName,
  );
}
```

{% include code-caption.html content="/src/authorization/providers/authorization-action.provider.ts" %}

```ts
import {Getter, inject, Provider} from '@loopback/context';

import {AuthorizationBindings} from '../keys';
import {AuthorizationMetadata, AuthorizeFn} from '../types';

import {intersection} from 'lodash';

export class AuthorizeActionProvider implements Provider<AuthorizeFn> {
  constructor(
    @inject.getter(AuthorizationBindings.METADATA)
    private readonly getMetadata: Getter<AuthorizationMetadata>,
  ) {}

  value(): AuthorizeFn {
    return response => this.action(response);
  }

  async action(userPermissions: string[]): Promise<boolean> {
    const metadata: AuthorizationMetadata = await this.getMetadata();
    if (!metadata) {
      return false;
    } else if (metadata.permissions.indexOf('*') === 0) {
      // Return immediately with true, if allowed to all
      // This is for publicly open routes only
      return true;
    }

    // Add your own business logic to fetch or
    // manipulate with user permissions here

    const permissionsToCheck = metadata.permissions;
    return intersection(userPermissions, permissionsToCheck).length > 0;
  }
}
```

Below is the user permissions manipulation logic. If there is no requirement of
user level permissions in your application, you can skip the below.

{% include code-caption.html content="/src/authorization/providers/user-permissions.provider.ts" %}

```ts
import {Provider} from '@loopback/context';

import {PermissionKey} from '../permission-key';
import {UserPermission, UserPermissionsFn} from '../types';

export class UserPermissionsProvider implements Provider<UserPermissionsFn> {
  constructor() {}

  value(): UserPermissionsFn {
    return (userPermissions, rolePermissions) =>
      this.action(userPermissions, rolePermissions);
  }

  action(
    userPermissions: UserPermission[],
    rolePermissions: PermissionKey[],
  ): PermissionKey[] {
    let perms: PermissionKey[] = [];
    // First add all permissions associated with role
    perms = perms.concat(rolePermissions);
    // Now update permissions based on user permissions
    userPermissions.forEach((userPerm: UserPermission) => {
      if (userPerm.allowed && perms.indexOf(userPerm.permission) < 0) {
        // Add permission if it is not part of role but allowed to user
        perms.push(userPerm.permission);
      } else if (!userPerm.allowed && perms.indexOf(userPerm.permission) >= 0) {
        // Remove permission if it is disallowed for user
        perms.splice(perms.indexOf(userPerm.permission), 1);
      }
    });
    return perms;
  }
}
```

Next, we need to expose these providers via Component to be bound to the
context.

{% include code-caption.html content="/src/authorization/component.ts" %}

```ts
import {Component, ProviderMap} from '@loopback/core';
import {AuthorizationBindings} from './keys';
import {AuthorizeActionProvider} from './providers/authorization-action.provider';
import {AuthorizationMetadataProvider} from './providers/authorization-metadata.provider';
import {UserPermissionsProvider} from './providers/user-permissions.provider';

export class AuthorizationComponent implements Component {
  providers?: ProviderMap;

  constructor() {
    this.providers = {
      [AuthorizationBindings.AUTHORIZE_ACTION.key]: AuthorizeActionProvider,
      [AuthorizationBindings.METADATA.key]: AuthorizationMetadataProvider,
      [AuthorizationBindings.USER_PERMISSIONS.key]: UserPermissionsProvider,
    };
  }
}
```

You can see that we have used the same binding keys which we created earlier.

Now, its time to create our method decorator function. Here it is. We will be
using the same metadata accessor key which we created earlier and the metadata
interface for accessing the data in decorator.

{% include code-caption.html content="/src/authorization/decorators/authorize.decorator.ts" %}

```ts
import {MethodDecoratorFactory} from '@loopback/core';
import {AuthorizationMetadata} from '../types';
import {AUTHORIZATION_METADATA_ACCESSOR} from '../keys';

export function authorize(permissions: string[]) {
  return MethodDecoratorFactory.createDecorator<AuthorizationMetadata>(
    AUTHORIZATION_METADATA_ACCESSOR,
    {
      permissions: permissions || [],
    },
  );
}
```

For error handling keys, lets create an enum.

{% include code-caption.html content="/src/authorization/error-keys.ts" %}

```ts
export const enum AuthorizeErrorKeys {
  NotAllowedAccess = 'Not Allowed Access',
}
```

Finally, we put everything together in one index file.

{% include code-caption.html content="/src/authorization/index.ts" %}

```ts
export * from './component';
export * from './types';
export * from './keys';
export * from './error-keys';
export * from './permission-key';
export * from './decorators/authorize.decorator';
export * from './providers/authorization-metadata.provider';
export * from './providers/authorization-action.provider';
export * from './providers/user-permissions.provider';
```

That is all for the authorization component. You can create all of the above
into a loopback extension as well. Everything remains the same. Refer to the
[extension generator](./Extension-generator.md) guide for creating an extension.

## Usage

In order to use the above component into our REST API application, we have a few
more steps to go.

- Add component to application.

{% include code-caption.html content="/src/application.ts" %}

```ts
this.component(AuthenticationComponent);
```

- Add permissions array to the role model.

{% include code-caption.html content="/src/models/role.model.ts" %}

```ts
@model({
  name: 'roles',
})
export class Role extends Entity {
  // .....
  // other attributes here
  // .....

  @property.array(String, {
    required: true,
  })
  permissions: PermissionKey[];

  constructor(data?: Partial<Role>) {
    super(data);
  }
}
```

- Add user level permissions array to the user model. Do this if there is a use
  case of explicit allow/deny of permissions at user-level in the application.
  You can skip otherwise.

{% include code-caption.html content="/src/models/user.model.ts" %}

```ts
@model({
  name: 'users',
})
export class User extends Entity {
  // .....
  // other attributes here
  // .....

  @property.array(String)
  permissions: UserPermission[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}
```

- Add a step in custom sequence to check for authorization whenever any end
  point is hit.

{% include code-caption.html content="/src/sequence.ts" %}

```ts
import {inject} from '@loopback/context';
import {
  FindRoute,
  getModelSchemaRef,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
  HttpErrors,
} from '@loopback/rest';
import {AuthenticationBindings, AuthenticateFn} from './authenticate';
import {
  AuthorizationBindings,
  AuthorizeFn,
  AuthorizeErrorKeys,
} from './authorization';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
    @inject(AuthorizationBindings.USER_PERMISSIONS)
    protected fetchUserPermissons: UserPermissionsFn,
    @inject(AuthorizationBindings.AUTHORIZE_ACTION)
    protected checkAuthorization: AuthorizeFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      // Do authentication of the user and fetch user permissions below
      const authUser: AuthResponse = await this.authenticateRequest(request);
      // Parse and calculate user permissions based on role and user level
      const permissions: PermissionKey[] = this.fetchUserPermissons(
        authUser.permissions,
        authUser.role.permissions,
      );
      // This is main line added to sequence
      // where we are invoking the authorize action function to check for access
      const isAccessAllowed: boolean = await this.checkAuthorization(
        permissions,
      );
      if (!isAccessAllowed) {
        throw new HttpErrors.Forbidden(AuthorizeErrorKeys.NotAllowedAccess);
      }
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.reject(context, err);
    }
  }
}
```

Now we can add access permission keys to the controller methods using authorize
decorator as below.

```ts
@authorize([PermissionKey.CreateRoles])
@post(rolesPath, {
  responses: {
    [STATUS_CODE.OK]: {
      description: 'Role model instance',
      content: {
        [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(Role)}},
      },
    },
  },
})
async create(@requestBody() role: Role): Promise<Role> {
  return this.roleRepository.create(role);
}
```

This endpoint will only be accessible if logged in user has permission
'CreateRoles'.
