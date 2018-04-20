import {validate, validatable, VALIDATION_KEY} from '../..';
import {expect} from '@loopback/testlab';
import {MetadataInspector} from '@loopback/metadata';

describe('validate', () => {
  it('can be used to persist validation metadata', () => {
    class TestClass {
      testMethod(testParam: string) {}
    }
    const inst = new TestClass();
    validate({format: 'email'})(inst, 'testMethod', 0);
    const meta = MetadataInspector.getAllParameterMetadata(
      VALIDATION_KEY,
      inst,
      'testMethod',
    );
    expect(meta).to.containEql({format: 'email'});
  });
  it('can be used to create custom decorators', () => {
    function emailValidator() {
      return validate({format: 'email'});
    }
    class EmailController {
      @validatable()
      createEmail(@emailValidator() email: string) {
        return email;
      }
    }

    const ctrl = new EmailController();
    expect(() => ctrl.createEmail('foobar')).to.throw(
      /should match format "email"/,
    );
  });
});
