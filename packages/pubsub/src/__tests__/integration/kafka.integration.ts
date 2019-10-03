// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {KafkaPubSubConnector} from './kafka.connector';
import {testPubSubConnector} from './pubsub.integration';

testPubSubConnector(
  'Kafka',
  new KafkaPubSubConnector({kafkaHost: '127.0.0.1:9092'}),
  {
    groupId: `test-group`,
    autoCommit: true,
    autoCommitIntervalMs: 1000,
    fetchFromOffset: 'latest',
  },
);
