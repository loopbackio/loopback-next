scenarios('User starting app', (util, expect) => {
  context('Given an app using default configs', () => {
    let app;
    let client;

    before(() => {
      app = util.createApp();
      client = util.createClient(app);
      return app.start();
    });

    it('will start the app on port 3000', () => {
      return client
        .get('/')
        .then((result) => {
          expect(result.status).to.equal(200);
        });
    });
  });
});
