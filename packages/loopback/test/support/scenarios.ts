import expect from './expect';
import util from './util';

global['scenarios'] = function(description : string, cb) {
  describe(description, () => {
    cb(util, expect);
  });
};
