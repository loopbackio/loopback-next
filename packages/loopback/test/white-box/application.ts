import {Application, AppState} from 'loopback';

suite('Application', () => {
  suite('constructor(config?: AppConfig)', () => {
    test('without config arg', () => {
      const app = new Application();
      expect(app.config).to.be.an('object');
      expect(app.config.port).to.eql(3000);
    });
  })

  suite('start()', () => {
    test('when state is cold', async () => {
      const app = new Application();
      expect(app.state).to.equal(AppState.cold);
      await app.start();
      expect(app.state).to.equal(AppState.listening);
    });
  });
});