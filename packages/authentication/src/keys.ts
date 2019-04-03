// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Strategy} from 'passport';
import {AuthenticateFn, UserProfile} from './types';
import {AuthenticationMetadata} from './decorators';
import {BindingKey} from '@loopback/context';
import {MetadataAccessor} from '@loopback/metadata';

/**
 * Binding keys used by this component.
 */
export namespace AuthenticationBindings {
  /**
   * Key used to bind an authentication strategy to the context for the
   * authentication function to use.
   *
   * ```ts
   * server
   *   .bind(AuthenticationBindings.STRATEGY)
   *   .toProvider(MyPassportStrategyProvider);
   * ```
   */
  export const STRATEGY = BindingKey.create<Strategy | undefined>(
    'authentication.strategy',
  );

  /**
   * Key used to inject the authentication function into the sequence.
   *
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
   * Key used to inject authentication metadata, which is used to determine
   * whether a request requires authentication or not.
   *
   * ```ts
   * class MyPassportStrategyProvider implements Provider<Strategy | undefined> {
   *   constructor(
   *     @inject(AuthenticationBindings.METADATA)
   *     private metadata: AuthenticationMetadata,
   *   ) {}
   *   value(): ValueOrPromise<Strategy | undefined> {
   *     if (this.metadata) {
   *       const name = this.metadata.strategy;
   *       // logic to determine which authentication strategy to return
   *     }
   *   }
   * }
   * ```
   */
  export const METADATA = BindingKey.create<AuthenticationMetadata | undefined>(
    'authentication.operationMetadata',
  );

  /**
   * Key used to inject the user instance retrieved by the
   * authentication function
   *
   * class MyController {
   *   constructor(
   *     @inject(AuthenticationBindings.CURRENT_USER) private user: UserProfile,
   *   ) {}
   *
   * // ... routes that may need authentication
   * }
   */
  export const CURRENT_USER = BindingKey.create<UserProfile | undefined>(
    'authentication.currentUser',
  );
}

/**
 * The key used to store log-related via @loopback/metadata and reflection.
 */
export const AUTHENTICATION_METADATA_KEY = MetadataAccessor.create<
  AuthenticationMetadata,
  MethodDecorator
>('authentication.operationsMetadata');
