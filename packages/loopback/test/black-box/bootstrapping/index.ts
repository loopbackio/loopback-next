scenarios('User starting app', (util, expect) => {
  context('Given an app using default configs', () => {
    let app;
    let client;

    before(async () => {
      app = util.createApp();
      client = util.createClient(app);
      await app.start();
    });

    it('will start the app on port 3000', async () => {
      let result = await client.get('/')
      expect(result.status).to.equal(200);
    });
  });
});
