// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, MetadataAccessor} from '@loopback/core';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Middleware} from '@loopback/rest';
import {AuthenticationComponent} from './authentication.component';
import {
  AuthenticateFn,
  AuthenticationMetadata,
  AuthenticationStrategy,
  UserProfileFactory,
} from './types';

/**
 * Binding keys used by this component.
 */
export namespace AuthenticationBindings {
  export const COMPONENT = BindingKey.create<AuthenticationComponent>(
    'components.AuthenticationComponent',
  );

  /**
   * Key used to bind a user profile factory to the context for any
   * consumer to use when they need to convert a user object
   * into a slimmer user profile object
   *
   * @example
   * ```ts
   * server
   *   .bind(AuthenticationBindings.USER_PROFILE_FACTORY)
   *   .to(myUserProfileFactory);
   * ```
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  export const USER_PROFILE_FACTORY = BindingKey.create<
    UserProfileFactory<any>
  >('authentication.userProfileFactory');

  /**
   * Key used to bind an authentication strategy or multiple strategies
   * to the context for the authentication function to use.
   *
   * @example
   * ```ts
   * server
   *   .bind(AuthenticationBindings.STRATEGY)
   *   .toProvider(MyAuthenticationStrategy);
   * ```
   */
  export const STRATEGY = BindingKey.create<
    AuthenticationStrategy | AuthenticationStrategy[] | undefined
  >('authentication.strategy');

  /**
   * Key used to inject the authentication function into the sequence.
   *
   * @example
   * ```ts
   * class MySequence implements SequenceHandler {
   *   constructor(
   *     @inject(AuthenticationBindings.AUTH_ACTION)
   *     protected authenticateRequest: AuthenticateFn,
   *     // ... other sequence action injections
   *   ) {}
   *
   *   async handle(context: RequestContext) {
   *     try {
   *       const {request, response} = context;
   *       const route = this.findRoute(request);
   *
   *      // Authenticate
   *       await this.authenticateRequest(request);
   *
   *       // Authentication successful, proceed to invoke controller
   *       const args = await this.parseParams(request, route);
   *       const result = await this.invoke(route, args);
   *       this.send(response, result);
   *     } catch (err) {
   *       this.reject(context, err);
   *     }
   *   }
   * }
   * ```
   */
  export const AUTH_ACTION = BindingKey.create<AuthenticateFn>(
    'authentication.actions.authenticate',
  );

  /**
   * Binding key for AUTHENTICATION_MIDDLEWARE
   */
  export const AUTHENTICATION_MIDDLEWARE = BindingKey.create<Middleware>(
    'middleware.authentication',
  );

  /**
   * Key used to inject authentication metadata, which is used to determine
   * whether a request requires authentication or not.
   *
   * @example
   * ```ts
   * class MyPassportStrategyProvider implements Provider<Strategy | undefined> {
   *   constructor(
   *     @inject(AuthenticationBindings.METADATA)
   *     private metadata?: AuthenticationMetadata[],
   *   ) {}
   *   value(): ValueOrPromise<Strategy | undefined> {
   *     if (this.metadata?.length) {
   *       // logic to determine which authentication strategy to return
   *     }
   *   }
   * }
   * ```
   */
  export const METADATA = BindingKey.create<
    AuthenticationMetadata[] | undefined
  >('authentication.operationMetadata');

  export const AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME =
    'authentication.strategies';

  // Make `CURRENT_USER` the alias of SecurityBindings.USER for backward compatibility
  export const CURRENT_USER: BindingKey<UserProfile> = SecurityBindings.USER;

  // Redirect url for authenticating current user
  export const AUTHENTICATION_REDIRECT_URL = BindingKey.create<string>(
    'authentication.redirect.url',
  );

  // Authentication redirect status, usually 302 or 303, indicates a web client will redirect
  export const AUTHENTICATION_REDIRECT_STATUS = BindingKey.create<number>(
    'authentication.redirect.status',
  );
}

/**
 * The key used to store method-level metadata for `@authenticate`
 */
export const AUTHENTICATION_METADATA_METHOD_KEY = MetadataAccessor.create<
  AuthenticationMetadata,
  MethodDecorator
>('authentication:method');

/**
 * Alias for AUTHENTICATION_METADATA_METHOD_KEY to keep it backward compatible
 */
export const AUTHENTICATION_METADATA_KEY = AUTHENTICATION_METADATA_METHOD_KEY;

/**
 * The key used to store class-level metadata for `@authenticate`
 */
export const AUTHENTICATION_METADATA_CLASS_KEY = MetadataAccessor.create<
  AuthenticationMetadata,
  ClassDecorator
>('authentication:class');
