// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {once} from 'events';
import express, {Request} from 'express';
import {Server} from 'http';

/**
 * A mockup server for https://github.com/prometheus/pushgateway
 */
export class PushGateway {
  private server?: Server;
  private metrics = new Map<string, string>();
  puts = 0;
  posts = 0;

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
      // The actual metrics format appends the grouping key as labels, but this
      // will do for the tests
      const output: string[] = [];
      this.metrics.forEach((value, key) => {
        output.push(`${key}\n${value}`);
      });
      res.send(output.join('\n'));
    });

    app.put(
      ['/metrics/job/:jobName', '/metrics/job/:jobName/:labelName/:labelValue'],
      (req, res) => {
        this.metrics.set(this.groupingKey(req), req.body);
        res.send('\n');
        ++this.puts;
      },
    );

    app.post(
      ['/metrics/job/:jobName', '/metrics/job/:jobName/:labelName/:labelValue'],
      (req, res) => {
        // Not quite the real behaviour of Pushgateway's POST, but this will
        // also do for the tests
        const key = this.groupingKey(req);
        if (this.metrics.has(key)) {
          this.metrics.set(key, this.metrics.get(key)!.concat('\n', req.body));
        } else {
          this.metrics.set(key, req.body);
        }
        res.send('\n');
        ++this.posts;
      },
    );

    this.server = app.listen(port);
    await once(this.server, 'listening');
    return this.server;
  }

  private groupingKey(req: Request): string {
    const key = `job="${req.params.jobName}"`;
    return req.params.labelName
      ? key.concat(`,${req.params.labelName}="${req.params.labelValue}"`)
      : key;
  }

  reset() {
    this.metrics.clear();
    this.puts = 0;
    this.posts = 0;
  }

  async stop() {
    if (!this.server) return;
    this.server.close();
    await once(this.server, 'close');
    this.server = undefined;
  }
}
