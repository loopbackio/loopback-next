// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports.templateFn = function (values) {
  return {
    apiVersion: 'extensions/v1beta1',
    kind: 'Deployment',
    metadata: {
      labels: {
        name: values.name,
      },
      name: values.name,
      namespace: values.namespace,
    },
    spec: {
      template: {
        metadata: {
          labels: {
            app: values.name,
          },
        },
        spec: {
          containers: [
            {
              name: values.name,
              image: values.image,
              ports: [{
                name: 'rest',
                containerPort: values.targetPort,
                protocol: 'TCP'
              }],
              resources: {},
              imagePullPolicy: 'IfNotPresent'
            },
          ],
        },
      },
    },
  };
};
