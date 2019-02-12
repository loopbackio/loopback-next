'use strict';

const RelationGenerator = require('./relation');

module.exports = class RelationHasOne extends RelationGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  generateControllers(options) {
    throw new Error('Not implemented');
  }

  generateModels(options) {
    throw new Error('Not implemented');
  }

  generateRepositories(options) {
    throw new Error('Not implemented');
  }
};
