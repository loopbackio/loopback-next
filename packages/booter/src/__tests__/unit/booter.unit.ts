// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/booter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createBindingFromClass} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {Booter, booter} from '../..';
import {BooterBindings, BooterTags} from '../../keys';

describe('@booter', () => {
  it('decorates a class as booter', () => {
    @booter('my-artifacts')
    class MyBooter implements Booter {}

    const binding = createBindingFromClass(MyBooter);
    expect(binding.tagMap).to.have.property(BooterTags.BOOTER);
    expect(binding.tagMap.namespace).to.equal(BooterBindings.BOOTERS);
    expect(binding.key).to.equal(`${BooterBindings.BOOTERS}.MyBooter`);
  });
});
