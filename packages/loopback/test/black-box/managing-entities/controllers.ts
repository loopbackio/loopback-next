import * as util from 'loopback/test/support/util';

Feature('Managing controllers in the app',
    'In order to implement my business logic',
    'As an app dev',
    'I want to use controllers in my app', () => {
  // need a beforeEach scenario to set up the same sample app
  // need a afterEach scenario to clean up garbage

  Scenario('Register a controller', () => {
    let app;
    let controller;
    Given('an app', () => {
      app = util.getSampleApp();
    });
    And('a controller', () => {
      controller = util.createController('note'); 
    });
    When('I register the controller', () => {
      // NOTE no autocomplete for inversify functions ATM, probably need to define app.d.ts with inversify mappings
      app.bind('notes controller').toConstantValue(controller);
    });
    Then('the controller is available in the app container', () => {
      expect(app.get('notes controller')).to.eql(controller);
    });
    // does not print to test output, good side effect because we can use text for notes
    // bad is afterEach does not work in here
    after('clean up container', () => {
      app.unbindAll();
    });
  });

  Scenario('Retrieve a controller', () => {
    let app;
    let controller;
    let actualController;
    Given('an app', () => {
      app = util.getSampleApp();
    });
    And('a controller previously registered in the app container', () => {
      controller = util.createController('note'); 
      app.bind('notes controller').toConstantValue(controller);
    });
    When('I retrieve the controller', () => {
      actualController = app.get('notes controller');
    });
    Then('the controller instance is returned', () => {
      expect(actualController).to.equal(controller);
    });
    after('clean up container', () => {
      app.unbindAll();
    });
  });

  Scenario('Unregister a controller', () => {
    let app;
    let controller;
    Given('an app', () => {
      app = util.getSampleApp();
    });
    And('a controller previously registered in the app container', () => {
      controller = util.createController('note'); 
      app.bind('notes controller').toConstantValue(controller);
    });
    When('I unregister the controller', () => {
      app.unbind('notes controller');
    });
    Then('the controller is no longer available in the app container', () => {
      expect(() => app.get('notes controller')).to.throw(/No matching bindings/);
    });
    after('clean up container', () => {
      app.unbindAll();
    });
  });

  Scenario('Check if controller is registered', () => {
    let app;
    let controller;
    let isRegistered;
    Given('an app', () => {
      app = util.getSampleApp();   
    });
    And('a controller already registered in the app', () => {
      controller = util.createController('note'); 
      app.bind('note controller').to(controller);
    });
    When('I check for a registered controller', () => {
      isRegistered = app.isBound('note controller');
    });
    Then('the list of currently registered controllers available in the container is returned', () => {
      expect(isRegistered).to.be.true();
    });
  });
});