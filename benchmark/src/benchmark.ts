// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import byline from 'byline';
import {ChildProcess, fork} from 'child_process';
import pEvent, {Emitter} from 'p-event';
import {Autocannon, EndpointStats} from './autocannon';
import {Client} from './client';
import {scenarios} from './scenarios';

const debug = require('debug')('loopback:benchmark');

export interface Scenario {
  setup(client: Client): Promise<void>;
  execute(autocannon: Autocannon): Promise<EndpointStats>;
}

export type ScenarioFactory = new () => Scenario;

export interface Options {
  /**
   * How long to run the benchmark - time in seconds.
   * Default: 30 seconds.
   */
  duration: number;
}

export interface Result {
  [scenario: string]: EndpointStats;
}

export type AutocannonFactory = (url: string) => Autocannon;

export class Benchmark {
  private options: Options;

  // Customization points
  public cannonFactory: AutocannonFactory;
  public logger: (title: string, stats: EndpointStats) => void;

  constructor(options?: Partial<Options>) {
    this.options = Object.assign(
      {
        duration: 30 /* seconds */,
      },
      options,
    );
    this.logger = function () {};
    this.cannonFactory = url => new Autocannon(url, this.options.duration);
  }

  async run(): Promise<Result> {
    const result: Result = {};
    for (const name in scenarios) {
      result[name] = await this.runScenario(name, scenarios[name]);
    }
    return result;
  }

  async runScenario(
    name: string,
    scenarioFactory: ScenarioFactory,
  ): Promise<EndpointStats> {
    debug('Starting scenario %j', name);
    const {worker, url} = await startWorker();
    debug('Worker started - pid=%s url=%s', worker.pid, url);

    const client = new Client(url);
    const autocannon = this.cannonFactory(url);

    const runner = new scenarioFactory();
    debug('Setting up the scenario');
    await runner.setup(client);
    debug('Pinging the app');
    await client.ping();
    debug('Starting the stress test.');
    const result = await runner.execute(autocannon);
    debug('Stats: %j', result);

    await closeWorker(worker);
    debug('Worker stopped, done.');

    this.logger(name, result);

    return result;
  }
}

function startWorker() {
  return new Promise<{worker: ChildProcess; url: string}>((resolve, reject) => {
    const lines: string[] = [];
    const child = fork(require.resolve('./worker'), [], {
      execArgv: ['--expose-gc'],
      stdio: ['pipe', 'pipe', process.stderr, 'ipc'],
    });

    child.once('error', reject);

    child.on('message', msg => {
      debug('Worker setup done, url is', msg.url);
      resolve({worker: child, url: msg.url});
    });

    child.once('exit', (code, signal) => {
      const msg = [
        `Child exited with code ${code} signal ${signal}.`,
        ...lines,
      ].join('\n');
      reject(new Error(msg));
    });

    const reader = byline.createStream(child.stdout);
    reader.on('data', line => {
      const str = line.toString();
      debug('[worker] %s', str);
      lines.push(str);
    });
  });
}

async function closeWorker(worker: ChildProcess) {
  worker.kill();
  await pEvent(
    // workaround for a bug in pEvent types which makes them
    // incompatible with "strictFunctionTypes"
    worker as Emitter<'worker', [unknown]>,
    'close',
  );
}
