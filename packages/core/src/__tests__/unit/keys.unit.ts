// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {CoreBindings, CoreTags} from '../..';

describe('CoreBindings', () => {
  describe('APPLICATION_INSTANCE', () => {
    it('has correct key', () => {
      expect(CoreBindings.APPLICATION_INSTANCE.key).to.equal(
        'application.instance',
      );
    });

    it('is a BindingKey', () => {
      expect(CoreBindings.APPLICATION_INSTANCE).to.be.instanceOf(BindingKey);
    });
  });

  describe('APPLICATION_CONFIG', () => {
    it('has correct key', () => {
      expect(CoreBindings.APPLICATION_CONFIG.key).to.equal(
        'application.config',
      );
    });

    it('is a BindingKey', () => {
      expect(CoreBindings.APPLICATION_CONFIG).to.be.instanceOf(BindingKey);
    });
  });

  describe('APPLICATION_METADATA', () => {
    it('has correct key', () => {
      expect(CoreBindings.APPLICATION_METADATA.key).to.equal(
        'application.metadata',
      );
    });

    it('is a BindingKey', () => {
      expect(CoreBindings.APPLICATION_METADATA).to.be.instanceOf(BindingKey);
    });
  });

  describe('SERVERS', () => {
    it('has correct value', () => {
      expect(CoreBindings.SERVERS).to.equal('servers');
    });

    it('is a string', () => {
      expect(CoreBindings.SERVERS).to.be.a.String();
    });
  });

  describe('COMPONENTS', () => {
    it('has correct value', () => {
      expect(CoreBindings.COMPONENTS).to.equal('components');
    });

    it('is a string', () => {
      expect(CoreBindings.COMPONENTS).to.be.a.String();
    });
  });

  describe('CONTROLLERS', () => {
    it('has correct value', () => {
      expect(CoreBindings.CONTROLLERS).to.equal('controllers');
    });

    it('is a string', () => {
      expect(CoreBindings.CONTROLLERS).to.be.a.String();
    });
  });

  describe('CONTROLLER_CLASS', () => {
    it('has correct key', () => {
      expect(CoreBindings.CONTROLLER_CLASS.key).to.equal(
        'controller.current.ctor',
      );
    });

    it('is a BindingKey', () => {
      expect(CoreBindings.CONTROLLER_CLASS).to.be.instanceOf(BindingKey);
    });
  });

  describe('CONTROLLER_METHOD_NAME', () => {
    it('has correct key', () => {
      expect(CoreBindings.CONTROLLER_METHOD_NAME.key).to.equal(
        'controller.current.operation',
      );
    });

    it('is a BindingKey', () => {
      expect(CoreBindings.CONTROLLER_METHOD_NAME).to.be.instanceOf(BindingKey);
    });
  });

  describe('CONTROLLER_METHOD_META', () => {
    it('has correct value', () => {
      expect(CoreBindings.CONTROLLER_METHOD_META).to.equal(
        'controller.method.meta',
      );
    });

    it('is a string', () => {
      expect(CoreBindings.CONTROLLER_METHOD_META).to.be.a.String();
    });
  });

  describe('CONTROLLER_CURRENT', () => {
    it('has correct key', () => {
      expect(CoreBindings.CONTROLLER_CURRENT.key).to.equal(
        'controller.current',
      );
    });

    it('is a BindingKey', () => {
      expect(CoreBindings.CONTROLLER_CURRENT).to.be.instanceOf(BindingKey);
    });
  });

  describe('LIFE_CYCLE_OBSERVERS', () => {
    it('has correct value', () => {
      expect(CoreBindings.LIFE_CYCLE_OBSERVERS).to.equal('lifeCycleObservers');
    });

    it('is a string', () => {
      expect(CoreBindings.LIFE_CYCLE_OBSERVERS).to.be.a.String();
    });
  });

  describe('LIFE_CYCLE_OBSERVER_REGISTRY', () => {
    it('has correct key', () => {
      expect(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY.key).to.equal(
        'lifeCycleObserver.registry',
      );
    });

    it('is a BindingKey', () => {
      expect(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY).to.be.instanceOf(
        BindingKey,
      );
    });
  });

  describe('LIFE_CYCLE_OBSERVER_OPTIONS', () => {
    it('has correct key', () => {
      expect(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS.key).to.equal(
        'lifeCycleObserver.options',
      );
    });

    it('is a BindingKey', () => {
      expect(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS).to.be.instanceOf(
        BindingKey,
      );
    });
  });

  describe('namespace consistency', () => {
    it('all binding keys are unique', () => {
      const keys = [
        CoreBindings.APPLICATION_INSTANCE.key,
        CoreBindings.APPLICATION_CONFIG.key,
        CoreBindings.APPLICATION_METADATA.key,
        CoreBindings.CONTROLLER_CLASS.key,
        CoreBindings.CONTROLLER_METHOD_NAME.key,
        CoreBindings.CONTROLLER_CURRENT.key,
        CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY.key,
        CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS.key,
      ];

      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).to.equal(keys.length);
    });

    it('all string constants are unique', () => {
      const constants = [
        CoreBindings.SERVERS,
        CoreBindings.COMPONENTS,
        CoreBindings.CONTROLLERS,
        CoreBindings.CONTROLLER_METHOD_META,
        CoreBindings.LIFE_CYCLE_OBSERVERS,
      ];

      const uniqueConstants = new Set(constants);
      expect(uniqueConstants.size).to.equal(constants.length);
    });
  });
});

describe('CoreTags', () => {
  describe('COMPONENT', () => {
    it('has correct value', () => {
      expect(CoreTags.COMPONENT).to.equal('component');
    });

    it('is a string', () => {
      expect(CoreTags.COMPONENT).to.be.a.String();
    });
  });

  describe('SERVER', () => {
    it('has correct value', () => {
      expect(CoreTags.SERVER).to.equal('server');
    });

    it('is a string', () => {
      expect(CoreTags.SERVER).to.be.a.String();
    });
  });

  describe('CONTROLLER', () => {
    it('has correct value', () => {
      expect(CoreTags.CONTROLLER).to.equal('controller');
    });

    it('is a string', () => {
      expect(CoreTags.CONTROLLER).to.be.a.String();
    });
  });

  describe('SERVICE', () => {
    it('has correct value', () => {
      expect(CoreTags.SERVICE).to.equal('service');
    });

    it('is a string', () => {
      expect(CoreTags.SERVICE).to.be.a.String();
    });
  });

  describe('SERVICE_INTERFACE', () => {
    it('has correct value', () => {
      expect(CoreTags.SERVICE_INTERFACE).to.equal('serviceInterface');
    });

    it('is a string', () => {
      expect(CoreTags.SERVICE_INTERFACE).to.be.a.String();
    });
  });

  describe('LIFE_CYCLE_OBSERVER', () => {
    it('has correct value', () => {
      expect(CoreTags.LIFE_CYCLE_OBSERVER).to.equal('lifeCycleObserver');
    });

    it('is a string', () => {
      expect(CoreTags.LIFE_CYCLE_OBSERVER).to.be.a.String();
    });
  });

  describe('LIFE_CYCLE_OBSERVER_GROUP', () => {
    it('has correct value', () => {
      expect(CoreTags.LIFE_CYCLE_OBSERVER_GROUP).to.equal(
        'lifeCycleObserverGroup',
      );
    });

    it('is a string', () => {
      expect(CoreTags.LIFE_CYCLE_OBSERVER_GROUP).to.be.a.String();
    });
  });

  describe('EXTENSION_FOR', () => {
    it('has correct value', () => {
      expect(CoreTags.EXTENSION_FOR).to.equal('extensionFor');
    });

    it('is a string', () => {
      expect(CoreTags.EXTENSION_FOR).to.be.a.String();
    });
  });

  describe('EXTENSION_POINT', () => {
    it('has correct value', () => {
      expect(CoreTags.EXTENSION_POINT).to.equal('extensionPoint');
    });

    it('is a string', () => {
      expect(CoreTags.EXTENSION_POINT).to.be.a.String();
    });
  });

  describe('tag uniqueness', () => {
    it('all tags are unique', () => {
      const tags = [
        CoreTags.COMPONENT,
        CoreTags.SERVER,
        CoreTags.CONTROLLER,
        CoreTags.SERVICE,
        CoreTags.SERVICE_INTERFACE,
        CoreTags.LIFE_CYCLE_OBSERVER,
        CoreTags.LIFE_CYCLE_OBSERVER_GROUP,
        CoreTags.EXTENSION_FOR,
        CoreTags.EXTENSION_POINT,
      ];

      const uniqueTags = new Set(tags);
      expect(uniqueTags.size).to.equal(tags.length);
    });
  });

  describe('tag naming conventions', () => {
    it('uses camelCase for tag names', () => {
      const tags = [
        CoreTags.COMPONENT,
        CoreTags.SERVER,
        CoreTags.CONTROLLER,
        CoreTags.SERVICE,
        CoreTags.SERVICE_INTERFACE,
        CoreTags.LIFE_CYCLE_OBSERVER,
        CoreTags.LIFE_CYCLE_OBSERVER_GROUP,
        CoreTags.EXTENSION_FOR,
        CoreTags.EXTENSION_POINT,
      ];

      for (const tag of tags) {
        // Check that tag doesn't contain spaces or special characters
        expect(tag).to.match(/^[a-zA-Z][a-zA-Z0-9]*$/);
      }
    });
  });
});

describe('Keys and Tags Integration', () => {
  it('CoreBindings and CoreTags are separate namespaces', () => {
    // Ensure there's no overlap between binding keys and tags
    const bindingKeys = [
      CoreBindings.APPLICATION_INSTANCE.key,
      CoreBindings.APPLICATION_CONFIG.key,
      CoreBindings.APPLICATION_METADATA.key,
      CoreBindings.SERVERS,
      CoreBindings.COMPONENTS,
      CoreBindings.CONTROLLERS,
      CoreBindings.CONTROLLER_CLASS.key,
      CoreBindings.CONTROLLER_METHOD_NAME.key,
      CoreBindings.CONTROLLER_METHOD_META,
      CoreBindings.CONTROLLER_CURRENT.key,
      CoreBindings.LIFE_CYCLE_OBSERVERS,
      CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY.key,
      CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS.key,
    ];

    const tags = [
      CoreTags.COMPONENT,
      CoreTags.SERVER,
      CoreTags.CONTROLLER,
      CoreTags.SERVICE,
      CoreTags.SERVICE_INTERFACE,
      CoreTags.LIFE_CYCLE_OBSERVER,
      CoreTags.LIFE_CYCLE_OBSERVER_GROUP,
      CoreTags.EXTENSION_FOR,
      CoreTags.EXTENSION_POINT,
    ];

    // Tags and binding keys should be distinct
    const allValues = [...bindingKeys, ...tags];
    const uniqueValues = new Set(allValues);
    expect(uniqueValues.size).to.equal(allValues.length);
  });

  it('related bindings and tags use consistent naming', () => {
    // Check that related concepts use similar naming
    expect(CoreBindings.SERVERS).to.equal('servers');
    expect(CoreTags.SERVER).to.equal('server');

    expect(CoreBindings.COMPONENTS).to.equal('components');
    expect(CoreTags.COMPONENT).to.equal('component');

    expect(CoreBindings.CONTROLLERS).to.equal('controllers');
    expect(CoreTags.CONTROLLER).to.equal('controller');

    expect(CoreBindings.LIFE_CYCLE_OBSERVERS).to.equal('lifeCycleObservers');
    expect(CoreTags.LIFE_CYCLE_OBSERVER).to.equal('lifeCycleObserver');
  });
});

// Made with Bob
