// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {once} from 'events';
import express from 'express';
import {Server} from 'http';

/**
 * A mockup server for https://github.com/prometheus/pushgateway
 */
export class PushGateway {
  private server?: Server;
  private metrics: string[] = [];

  async start(port = 9091) {
    const app = express();
    // A hack to force content-type to be `text/plain` as prom-client does not
    // set `Content-Type` header
    app.use((req, res, next) => {
      req.headers['content-type'] = 'text/plain';
      next();
    });
    app.use(express.text({type: '*/*'}));
    app.get('/metrics', (req, res) => {
      res.send(this.metrics.join('\n'));
    });

    app.post('/metrics/job/:jobName', (req, res) => {
      this.metrics.push(`job="${req.params.jobName}"\n${req.body}`);
      res.send('\n');
    });
    this.server = app.listen(port);
    await once(this.server, 'listening');
    return this.server;
  }

  async stop() {
    if (!this.server) return;
    this.server.close();
    await once(this.server, 'close');
    this.server = undefined;
  }
}
