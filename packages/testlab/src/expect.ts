// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Internal} from './should-as-function';

const shouldAsFunction: Internal = require('should/as-function');

shouldAsFunction.use((should, assertion) => {
  assertion.addChain('to');
});

export const expect = shouldAsFunction;
