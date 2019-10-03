// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {testPubSubConnector} from './pubsub.integration';
import {RedisPubSubConnector} from './redis.connector';

testPubSubConnector('Redis', new RedisPubSubConnector({}));
