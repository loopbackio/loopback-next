// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthenticationMetadata} from '../../..';

const options = {option1: 'value1', option2: 'value2'};

export const mockAuthenticationMetadata: AuthenticationMetadata = {
  strategy: 'MockStrategy',
  options,
};

export const mockAuthenticationMetadata2: AuthenticationMetadata = {
  strategy: 'MockStrategy2',
  options,
};
