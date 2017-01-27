import chai = require('chai');
import dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
const expect = chai.expect;

global['expect'] = expect;