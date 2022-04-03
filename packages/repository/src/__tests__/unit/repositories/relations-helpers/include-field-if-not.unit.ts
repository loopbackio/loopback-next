import {Fields} from '@loopback/filter';
import {expect} from '@loopback/testlab';
import {includeFieldIfNot} from '../../../..';

describe('includeFieldIfNot', () => {
  type MD = {
    field1: string;
    field2: number;
    field3: {field4: string; field5: boolean};
  };

  it('no-operation case 1 - empty dictionary', async () => {
    const fields: Fields<MD> = {};

    const result = includeFieldIfNot(fields, 'field1');
    let after: Fields<MD>;
    if (result === false) {
      after = fields;
    } else {
      after = result;
    }

    expect(after).to.eql(fields);
  });

  it('no-operation case 2 - empty array', async () => {
    const fields = [] as Fields<MD>;

    const result = includeFieldIfNot(fields, 'field1');
    let after: Fields<MD>;
    if (result === false) {
      after = fields;
    } else {
      after = result;
    }

    expect(after).to.eql(fields);
  });

  it('no-operation case 3 - included in dictionary', async () => {
    const fields: Fields<MD> = {
      field1: true,
    };

    const result = includeFieldIfNot(fields, 'field1');
    let after: Fields<MD>;
    if (result === false) {
      after = fields;
    } else {
      after = result;
    }

    expect(after).to.eql(fields);
  });

  it('no-operation case 4 - included in array', async () => {
    const fields = ['field1'] as Fields<MD>;

    const result = includeFieldIfNot(fields, 'field1');
    let after: Fields<MD>;
    if (result === false) {
      after = fields;
    } else {
      after = result;
    }

    expect(after).to.eql(fields);
  });

  it('dictionary form - other field included', async () => {
    const fields: Fields<MD> = {
      field2: true,
    };

    const result = includeFieldIfNot(fields, 'field1');
    let after: Fields<MD>;
    if (result === false) {
      after = fields;
    } else {
      after = result;
    }

    expect(after).to.eql({
      field1: true,
      field2: true,
    });
  });

  it('array form - other field included', async () => {
    const fields = ['field2'] as Fields<MD>;

    const result = includeFieldIfNot(fields, 'field1');
    let after: Fields<MD>;
    if (result === false) {
      after = fields;
    } else {
      after = result;
    }

    expect(after).to.eql({
      field1: true,
      field2: true,
    });
  });

  it('dictionary form - field excluded', async () => {
    const fields: Fields<MD> = {
      field1: false,
    };

    const result = includeFieldIfNot(fields, 'field1');
    let after: Fields<MD>;
    if (result === false) {
      after = fields;
    } else {
      after = result;
    }

    expect(after).to.eql({});
  });

  it('dictionary form - field excluded with other field included', async () => {
    const fields: Fields<MD> = {
      field1: false,
      field2: true,
    };

    const result = includeFieldIfNot(fields, 'field1');
    let after: Fields<MD>;
    if (result === false) {
      after = fields;
    } else {
      after = result;
    }

    expect(after).to.eql({
      field1: true,
      field2: true,
    });
  });
});
