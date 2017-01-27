import chai = require('chai');
import dirtyChai = require('dirty-chai');
import sinon = require('sinon');

chai.use(dirtyChai);

global['expect'] = chai.expect;
global['sinon'] = sinon;