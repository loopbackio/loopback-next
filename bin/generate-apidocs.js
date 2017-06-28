
/*
========

Usage:
  node ../../bin/generate-apidocs <target>

========
*/
'use strict';

// Call sdocs
require('child_process').spawn(
  'sdocs', // Typically '/usr/local/bin/node'
  ['-o', 'api-docs']
).on('close', (number, signal) => (process.exitCode = number));
