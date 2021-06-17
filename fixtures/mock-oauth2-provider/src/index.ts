// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/mock-oauth2-provider
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {startApp, stopApp} from './mock-oauth2-social-app';

export {MyUser, UserRepository, userRepository} from './user-repository';
export namespace MockTestOauth2SocialApp {
  export const startMock = startApp;
  export const stopMock = stopApp;
}

if (require.main === module) {
  const server = startApp();
  console.log('Mock oAuth2 provider is running at %s', server.address());
}
