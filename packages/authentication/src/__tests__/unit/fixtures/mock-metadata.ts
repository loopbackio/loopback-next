import {AuthenticationMetadata} from '../../..';

const options = {option1: 'value1', option2: 'value2'};

export const mockAuthenticationMetadata: AuthenticationMetadata = {
  strategy: 'MockStrategy',
  options,
};

export const mockAuthenticationMetadata2: AuthenticationMetadata = {
  strategy: ['MockStrategy', 'MockStrategy2'],
  options,
};
