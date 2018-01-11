import {get} from '../..';

describe('backward-compatibility', () => {
  it('exports functions from @loopback/openapi-v2', async () => {
    /* tslint:disable-next-line:no-unused-variable */
    class Test {
      // Make sure the decorators are exported
      @get('/test')
      async test() {
        return '';
      }
    }
  });
});
