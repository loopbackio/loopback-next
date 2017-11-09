// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {v4} from 'uuid';
import * as util from 'util';
import {inject, Setter} from '@loopback/context';

import {action} from '../..';

// tslint:disable:no-any

/**
   * Mockup http header
   */
export interface HttpRequest {
  url: string;
  verb: string;
  headers: {[header: string]: string};
  query: {[param: string]: string};
}

/**
   * StopWatch records duration for a request. There are two action methods:
   * - start: Start the timer
   * - stop: Stop the timer and calculates the duration
   */
@action({group: 'timer-group'})
export class StopWatch {
  /**
     * Start the timer (only to be invoked after http.request is set up)
     * @param startTime Use a setter to bind `startTime`
     */
  @action({dependsOn: ['http.request']})
  start(@inject.setter('startTime') startTime: Setter<Date>) {
    startTime(new Date());
  }

  /**
     * Calculate the duration
     * @param startTime
     */
  @action({bindsReturnValueAs: 'duration', dependsOn: ['invocation']})
  stop(@inject('startTime') startTime: Date): number {
    return new Date().getTime() - startTime.getTime();
  }
}

/**
   * Log the tracing id and duration for a given http request
   */
@action({fulfills: ['logging']})
export class Logger {
  /**
     * @param prefix The logging prefix
     */
  constructor(@inject('log.prefix') private prefix: string) {}

  /**
     * The logging level
     */
  @inject('log.level') level: string = 'INFO';

  private lastMessage: string; // For testing

  /**
     * Log the request tracing id and duration
     * @param tracingId The tracing id
     * @param duration The duration
     */
  @action({dependsOn: ['invocation']})
  log(
    @inject('tracingId') tracingId: string,
    @inject('duration') duration: number,
  ) {
    this.lastMessage = util.format(
      `[%s][%s] TracingId: %s, Duration: %d`,
      this.level,
      this.prefix,
      tracingId,
      duration,
    );
    console.log(this.lastMessage);
  }
}

/**
   * Set up tracing id
   */
@action()
export class Tracing {
  /**
     * Check and generate the tracing id for the http request
     * @param req The http request
     */
  @action({bindsReturnValueAs: 'tracingId'})
  setupTracingId(@inject('http.request') req: HttpRequest): string {
    let id = req.headers['X-Tracing-Id'];
    if (!id) {
      id = req.headers['X-Tracing-Id'] = v4();
    }
    return id;
  }
}

/**
   * Set up http request
   */
@action()
export class HttpServer {
  @action()
  createRequest(
    @inject.setter('http.request') httpRequestSetter: Setter<HttpRequest>,
  ) {
    httpRequestSetter({
      verb: 'get',
      url: 'http://localhost:3000',
      query: {},
      headers: {},
    });
  }
}

/**
   * Mock-up invoker for controller methods
   */
@action()
export class MethodInvoker {
  @action({
    bindsReturnValueAs: 'result',
    fulfills: ['invocation'],
    dependsOn: ['tracingId'],
  })
  // FIXME(rfeng) Allow controller.name/method/args to be injected
  invoke(): any {
    return new Promise((resolve, reject) => {
      // Artificially add 10ms delay to make duration significant
      setTimeout(() => {
        resolve('Hello, world');
      }, 10);
    });
  }
}

@action()
export class MyDummyAction {
  @action()
  static test(@inject('foo') foo: string) {}
}
