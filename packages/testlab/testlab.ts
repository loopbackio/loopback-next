import chai = require('chai');
import dirtyChai = require('dirty-chai');
import sinon = require('sinon');

chai.use(dirtyChai);

export const expect = chai.expect;
export {sinon};