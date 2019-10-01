// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DockerClient} from '../..';
import {expect} from '../../expect';

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe('docker', async function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  let verb: typeof it | typeof it.skip = it;
  const client = new DockerClient();
  const result = await client.isAvailable();
  if (!result) {
    verb = it.skip;
  }

  before(async () => {
    if (result) await client.pull('alpine:latest');
  });

  verb('inspects an image by name', async () => {
    const image = client.docker.getImage('alpine:latest');
    const info = await image.inspect();
    expect(info).containEql({RepoTags: ['alpine:latest']});
  });

  verb('runs a docker container', async () => {
    const [data, container] = await client.run(
      'alpine',
      ['sh', '-c', 'uname -a'],
      // {HostConfig: {AutoRemove: true}},
    );
    expect(data.StatusCode).to.eql(0);
    await container.remove();
  });

  verb('removes an image by name', async () => {
    const image = client.docker.getImage('alpine:latest');
    const info = await image.remove({force: true});
    expect(info).to.containEql({Untagged: 'alpine:latest'});
  });

  verb('pulls and runs a docker container', async () => {
    const [data, container] = await client.pullAndRun(
      'alpine',
      ['sh', '-c', 'uname -a'],
      // {HostConfig: {AutoRemove: true}},
    );
    expect(data.StatusCode).to.eql(0);
    await container.remove();
  });
});
