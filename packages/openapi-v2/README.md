@loopback/openapi-v2

This package contains:

- Decorators that describe LoopBack artifacts as OpenAPI v2 (Swagger) metadata.
- Utilities that transfer LoopBack metadata to OpenAPI v2 (Swagger) swagger specifications. 

## Overview

The package has functions described above for LoopBack controller classes.
Decorators apply REST api mapping metadata to controller classes and their members. And utilities that inspect controller classes to build OpenAPI v2 (Swagger) specifications from REST api mapping metadata.

Functions for more artifacts will be added when we need.

## Installation

```
$ npm install --save @loopback/openapi-v2
```

## Basic use

Currently this package only has spec generator for controllers.
It generates swagger `paths` and `basePath` specs for a given decorated controller class.

Here is an example of calling function `getControllerSpec` to generate the swagger spec:

```js
import {api, getControllerSpec} from '@loopback/openapi-v2';

@api(somePathSpec)
class MyController {
    greet() {
        return 'Hello world!';
    }
}

const myControllerSpec = getControllerSpec(MyController);
```

then the `myControllerSpec` will be:
```js
{
    swagger: '2.0',
    basePath: '/',
    info: { title: 'LoopBack Application', version: '1.0.0' },
    paths: { 
        '/greet': { 
            get: {
                responses:  { 
                    '200': { 
                        description: 'The string result.', 
                        schema: { type: 'string' } 
                    } 
                },
                'x-operation-name': 'greet' 
            }
        } 
    } 
}
```

For details of how to apply controller decorators, please check http://loopback.io/doc/en/lb4/Decorators.html#route-decorators

## Related resources

See https://www.openapis.org/ and [version 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)
of OpenAPI Specification.

## Contributions

IBM/StrongLoop is an active supporter of open source and welcomes contributions to our projects as well as those of the Node.js community in general. For more information on how to contribute please refer to the [Contribution Guide](https://loopback.io/doc/en/contrib/index.html).

# Tests

run `npm test` from the root folder.

# Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

# License

MIT