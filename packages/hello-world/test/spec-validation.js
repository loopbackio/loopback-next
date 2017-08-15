const testlab = require('@loopback/testlab');
const nodeMajorVersion = +process.versions.node.split('.')[0];
const createApp = nodeMajorVersion >= 7 ?
  require('../lib/application').createApp :
  require('../lib6/application').createApp;
const expect = testlab.expect;
const validateApiSpec = testlab.validateApiSpec;

describe('Binding', () => {
  let app;
  let apiSpec;
  before(initApp);

  describe('validate Api Spec', () => {
    const defaultPreamble = {
      swagger: '2.0',
      basePath: '/',
      info: {
        title: 'LoopBack Application',
        version: '1.0.0',
      }
    };

    // TODO [setogit] getApiSpec is not yet available in CI environment
    // TODO [setogit] use async-await with validateApiSpec call
    // if (!isCI()) {
      it('app.getApiSpec is function', () => {
        expect(app.getApiSpec).to.be.type('function');
      });

      it('apiSpec is defined', () => {
        expect(apiSpec).to.containEql(defaultPreamble);
      });

      it('apiSpec is valid', () => {
        validateApiSpec(apiSpec);
      });
    // }

  });

  function initApp() {
    app = createApp();
    if (!isCI()) apiSpec = app.getApiSpec();
  }

  function isCI() {
    return isInTravisCI() || isInJenkinsCI();
  }

  function isInTravisCI() {
    return process.env.TRAVIS_JOB_ID;
  }

  function isInJenkinsCI() {
    return (process.env.JENKINS_URL && process.env.BUILD_ID);
  }

});
