/// <reference path="./dirty-chai.d.ts" />

import chai = require('chai');
import dirtyChai = require('dirty-chai');
import sinon = require('sinon');
import supertest = require('supertest');

chai.use(dirtyChai);

export const expect = <DirtyChai.ExpectStatic> chai.expect;
export {sinon};
export {supertest};
