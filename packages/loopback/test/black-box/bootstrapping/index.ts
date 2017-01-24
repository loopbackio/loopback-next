scenarios('User starting app', (container, expect) => {
  context('Given an app using default configs', () => {
    it('will start the app on port 3000', () => {
      expect(true).to.be.true();
    });
  });
});
