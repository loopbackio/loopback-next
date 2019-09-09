// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports = {
  canImportModelName,
};

// List of built-in LB models to exclude from the prompt
const EXCLUDED_MODEL_NAMES = [
  // base models
  'Model',
  'PersistedModel',
  'KeyValueModel',
  // change tracking & replication
  'Change',
  'Checkpoint',
  // Email - a dummy model used to attach email-connector methods only
  'Email',
];

function canImportModelName(name) {
  if (EXCLUDED_MODEL_NAMES.includes(name)) return false;
  // TODO: find out where are anonymous models coming from
  // (perhaps from object types defined inside property definitions?)
  // and add test cases to verify that we are handling those scenarios correctly
  if (name.startsWith('AnonymousModel_')) return false;
  return true;
}
