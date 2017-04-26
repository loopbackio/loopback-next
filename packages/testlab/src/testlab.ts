/// <reference path="./should-as-function.d.ts" />

import shouldAsFunction = require('should/as-function');
import sinon = require('sinon');
import supertest = require('supertest');

shouldAsFunction.use((should, assertion) => {
  assertion.addChain('to');
});

export const expect = <Internal> shouldAsFunction;
export {sinon};
export {supertest};
