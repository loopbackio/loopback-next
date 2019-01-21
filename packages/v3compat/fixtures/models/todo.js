// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function(Todo) {
  // A dummy custom method to verify that model JS file was correctly processed
  Todo.findByTitle = function(title) {
    return this.find({where: {title}});
  };
};
