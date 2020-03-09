---
lang: en
title: 'Extending OpenAPI Specification'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Extending-OpenAPI-specification.html
---

## OpenAPI Specification Enhancer

The APIs in a LoopBack `RestApplication` are described by the
[OpenAPI Specification (short for OAS)](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md).
An application's OAS is mainly generated from
[controllers](https://loopback.io/doc/en/lb4/Controllers.html) and their
members' metadata. Besides this, we would also like to contribute specifications
from other places. Therefore, an extension point `OASEnhancerService` is created
to allow registered extensions to provide their OAS fragments and modify a rest
application's specification.

_Read about the extension point/extension pattern in
[documentation](Extension-point-and-extensions.md)_

## Adding a New OAS Enhancer

Interface `OASEnhancer` is created in `@loopback/openapi-v3` to describe the
specification enhancers. A typical OAS enhancer class should have a string type
`name` field and a function `modifySpec()` to modify the current specification.

For example, to modify the `info` field of an OAS, you can create an
`InfoSpecEnhancer` that implements interface `OASEnhancer` as follows:

```ts
import {bind} from '@loopback/core';
import {
  mergeOpenAPISpec,
  asSpecEnhancer,
  OASEnhancer,
  OpenApiSpec,
} from '@loopback/openapi-v3';

/**
 * A spec enhancer to add OpenAPI info spec
 */
@bind(asSpecEnhancer)
export class InfoSpecEnhancer implements OASEnhancer {
  // give your enhancer a proper name
  name = 'info';

  // takes in the current spec, modifies it, and returns a new one
  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const InfoPatchSpec = {
      info: {title: 'LoopBack Test Application', version: '1.0.1'},
    };
    // the example calls a default helper function to merge the fragment spec.
    const mergedSpec = mergeOpenAPISpec(spec, InfoPatchSpec);
    return mergedSpec;
  }
}
```

- The class is decorated with a binding template `asSpecEnhancer`.
- The enhancer has a name as `info`. Name can be used to retrieve a certain
  enhancer (explained in the
  [extension point section](#oas-enhancer-service-as-extension-point)).
- The enhancer changes the current specification's `info` object in function
  `modifySpec`.
- It calls [`mergeOpenAPISpec`](#default-merge-function) to merge the
  specification fragment into the current spec.

### Default Merge Function

Since `modifySpec` has full access to the current spec, it can perform any
operation: merge, delete, or more complicated changes. This is totally
determined by the extension contributor.

To apply the basic merging, we provide a default helper function called
`mergeOpenAPISpec` that leverages
[`json-merge-patch`](https://github.com/pierreinglebert/json-merge-patch) to
merge two json objects. You can find its usage in the
[previous section](#adding-a-new-oas-enhancer)

### Registering an Enhancer

After decorating your enhancer properly with `@bind(asSpecEnhancer)`, you can
bind it to your application as follows:

```ts
import {createBindingFromClass} from '@loopback/core';
import {InfoSpecEnhancer} from './enhancers/infoSpecEnhancer';

class MyApplication extends RestApplication {
  constructor() {
    super();
    this.add(createBindingFromClass(InfoSpecEnhancer));
  }
}
```

## OAS Enhancer Service as Extension Point

The OAS enhancer extension point is created in package `@loopback/openapi-v3`.
It organizes the registered OAS enhancers, and provides APIs to either apply one
enhancer by name, or apply all enhancers automatically.

### Registering an Enhancer Service

You can bind the OAS enhancer extension point to your app via key
`OASEnhancerBindings.OAS_ENHANCER_SERVICE`:

```ts
import {RestApplication} from '@loopback/rest';
import {OASEnhancerService, OASEnhancerBindings} from '@loopback/openapi-v3';

class MyApplication extends RestApplication {
  constructor() {
    super();
    this.add(
      createBindingFromClass(OASEnhancerService, {
        key: OASEnhancerBindings.OAS_ENHANCER_SERVICE,
      }),
    );
  }

  // define a function to return a spec service by the same key
  getSpecService() {
    return this.get(OASEnhancerBindings.OAS_ENHANCER_SERVICE);
  }
}
```

### Applying Registered Enhancers

To automatically apply all the registered enhancers, call `applyAllEnhancers`:

```ts
await app.getSpecService.applyAllEnhancers();
```

_In the future we will support applying enhancers by a custom sequence. The
sequence will be determined by a combination of group names and the alphabetical
order._

To retrieve an enhancer by name, call `getEnhancerByName`:

```ts
await app.getSpecService.getEnhancerByName('info');
```

To apply an enhancer by name, call `applyEnhancerByName`:

```ts
await app.getSpecService.applyEnhancerByName('info');
```
