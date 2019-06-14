global.context = function(...args) {
  return global.describe(...args);
};

global.before = function(...args) {
  return global.beforeAll(...args);
};

global.after = function(...args) {
  return global.afterAll(...args);
};
