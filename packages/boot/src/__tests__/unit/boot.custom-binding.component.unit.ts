// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingKey,
  BindingScope,
  Component,
  ContextTags,
  injectable,
} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {BootBindings, BootMixin} from '../../';
import {BaseArtifactBooter} from '../../booters';
import {InstanceWithBooters} from '../../types';

describe('boot.component unit tests', () => {
  it('binds a component with the custom binding key', async () => {
    const app = getApp();
    app.component(CustomBoundComponent);
    await app.boot();
    const bootstrapper = await app.get(CustomBinding);
    expect(bootstrapper).to.be.an.instanceOf(CustomBoundComponent);
  });

  it('binds mounts booters from an instance', async () => {
    const app = getApp();
    const component = new ClassicComponent(__dirname, {});
    app.bind('components.ClassicComponent').to(component);

    // covers the resolveComponentInstance functionality
    app.mountComponentBooters(ClassicComponent);
    await app.boot();
    const bootstrapper: ClassicComponent = await app.get(
      'components.ClassicComponent',
    );
    expect(bootstrapper).to.be.an.instanceOf(ClassicComponent);
  });

  function getApp() {
    const app = new BootableApp();
    app.bind(BootBindings.PROJECT_ROOT).to(__dirname);
    return app;
  }
  class BootableApp extends BootMixin(Application) {}

  const CustomBinding = BindingKey.create<CustomBoundComponent>(
    'io.loopback.custom.binding.CustomBoundComponent',
  );
  @injectable({
    tags: {[ContextTags.KEY]: CustomBinding},
    scope: BindingScope.SINGLETON,
  })
  class CustomBoundComponent implements Component {
    configured = false;
    async configure() {
      this.configured = true;
    }
  }

  class ClassicComponent
    extends BaseArtifactBooter
    implements InstanceWithBooters {
    configured = false;
    async configure() {
      this.configured = true;
    }
    booters = [];
  }
});
