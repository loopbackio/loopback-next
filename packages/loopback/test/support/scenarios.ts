import container from './container';
import expect from './expect';

global.scenarios = function(description : string, cb) {
  describe(description, () => {
    cb(container, expect);
  });
}