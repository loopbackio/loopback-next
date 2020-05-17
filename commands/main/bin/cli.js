#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-main
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

require('@oclif/command')
  .run()
  .then(require('@oclif/command/flush'))
  .catch(require('@oclif/errors/handle'));
