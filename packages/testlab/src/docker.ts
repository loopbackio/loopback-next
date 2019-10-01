// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as Dockerode from 'dockerode';
import {Container, DockerOptions} from 'dockerode';

/**
 * Options for docker pull/docker container create/docker container start
 */
export type DockerCommandOptions = {
  pull?: object;
  create?: object;
  start?: object;
  auth?: object;
};

export class DockerClient {
  readonly docker: Dockerode;
  constructor(options?: DockerOptions) {
    this.docker = new Dockerode(options);
  }

  async isAvailable() {
    try {
      const data: Buffer = await this.docker.ping();
      return data.toString('utf-8');
    } catch (err) {
      return false;
    }
  }

  info() {
    return this.docker.info();
  }

  /**
   * Pull a docker image
   * @param image - Docker image
   * @param options
   * @param auth
   */
  async pull(image: string, options: DockerCommandOptions = {}) {
    const stream = await this.docker.pull(
      image,
      options.pull || {},
      options.auth,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Promise<any>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.docker.modem.followProgress(stream, (err: any, res: any) =>
        err ? reject(err) : resolve(res),
      );
    });
  }

  /**
   * Run a docker container from the image
   * @param image - Docker image
   * @param cmd - Command
   * @param options - Options to create/start the container
   */
  async run(image: string, cmd: string[], options: DockerCommandOptions = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: [any, Container] = await this.docker.run(
      image,
      cmd,
      process.stdout,
      options.create,
      options.start,
    );
    return data;
  }

  async pullAndRun(
    image: string,
    cmd: string[],
    options: {
      pull?: object;
      create?: object;
      start?: object;
      auth?: object;
    } = {},
  ) {
    const img = this.docker.getImage(image);
    try {
      await img.inspect();
    } catch (err) {
      if (err.statusCode === 404) {
        await this.pull(image, options);
      } else {
        throw err;
      }
    }
    return this.run(image, cmd, options);
  }
}
