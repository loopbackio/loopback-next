// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {
  startApp,
  stopApp,
} from './__tests__/acceptance/fixtures/mock-oauth2-social-app';

/**
 * An adapter to plug in passport based strategies to the authentication system
 * in {@link @loopback/authentication# | @loopback/authentication @3.x }.
 *
 * @remarks
 * {@link @loopback/authentication# | @loopback/authentication @3.x } allows
 * users to register authentication strategies that implement the interface
 * `AuthenticationStrategy`.
 *
 * Since AuthenticationStrategy describes a strategy with different contracts
 * than the passport Strategy, and we'd like to support the existing 500+
 * community passport strategies, an adapter class is created in this package to
 * convert a passport strategy to the one that LoopBack 4 authentication system
 * wants.
 *
 * @packageDocumentation
 */

export * from './strategy-adapter';

export namespace MockTestOauth2SocialApp {
  export const startMock = startApp;
  export const stopMock = stopApp;
}
