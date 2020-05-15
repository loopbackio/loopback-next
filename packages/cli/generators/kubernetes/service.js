// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports.templateFn = function (values) {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: values.name,
      namespace: values.namespace,
    },
    spec: {
      type: values.serviceType,
      ports: [
        {
          port: values.port,
          targetPort: values.targetPort,
        },
      ],
      selector: {
        app: values.name,
      },
    },
  };
};
