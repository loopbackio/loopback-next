# Migration

## @param

### Remove method level @param

Related discussion see https://github.com/strongloop/loopback-next/pull/940#discussion_r165409785

### parameter location

In v3 the valid parameter locations is: 'query', 'path', 'header', 'cookie'

## @requestBody

Copied from official document:

https://swagger.io/docs/specification/describing-request-body/

* Body and form parameters are replaced with requestBody.
* Operations can now consume both form data and other media types such as JSON.
* The consumes array is replaced with the requestBody.content map which maps the media types to their schemas.
* Schemas can vary by media type.
  anyOf and oneOf can be used to specify alternate schemas.
* Form data can now contain objects, and you can specify the serialization strategy for objects and arrays.
* GET, DELETE and HEAD are no longer allowed to have request body because it does not have defined semantics as per RFC 7231.

Our v3 decorator in this PR:

```js
// v2 decorator

@model()
class Note {
  @property() message: string
}

class MyController {
  @post('/note')
  create(@param.body() note: Note) {
    
  }
}
```

is refactorted to

```js
// v3 decorator

@model()
class Note {
  @property() message: string
}

class MyController {
  @post('/note')
  create(@requestBody() note: Note) {
    
  }
}
```

## content type

### responses object supports multiple content type

```js
// v2 response object
{
  '200': {
    description: 'a response',
    schema: {...schemaSpec}
  }
}
```

is refactored to:

```js
// v3 response object
{
  '200': {
    content: {
      '*/*': {
        description: 'a response',
        schema: {...schemaSpec}
      }
    }
  }
}
```

### requestBody object supports multiple content type

```js
// v3 requestBody object
{
  description: 'request body spec',
  content: {
    'application/json': {
      schema: {...schemaSpec}
    }
  }
}
```


Discussion:

If people decorate an argument with no input as `@requestBody() foo: Foo`, 
I make `application/json` as the default content, is it ok?


## common name for OpenAPI data types

reference link: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0md#data-types

I created shortcut for `@param` accordingly, if we are good with them, 
I will create same shortcuts for `@requestBody` too.

### server

```js
// v2 swagger spec
{
  basePath: '/',
  port: '3000',
  host: 'localhost'
}
```

is refactored to:

```js
// v3 swagger spec
{
  servers: [
    {url: 'localhost:3000/'}
  ]
}
```

### response spec

see section #content-type

### validator

In package `testlab`, we switch to openapi 3 validator provided by

[swagger2openapi/validate.js](https://github.com/Mermade/swagger2openapi/blob/master/validate.js)


### components/schemas

```js
// v2 swagger spec
{
  definitions: {
    Pet: {...PetSpec}
  }
}
```

is refactored to:

```js
// v3 swagger spec
{
  components: {
    schemas: {
      Pet: {...PetSpec}
    }
  }
}
```


# Features

## Parameter Serialization

* Complex Serialization in Form Data
* Serialization in parameter

## Security Schema

## Restriction for GET, DELETE and HEAD

They are no longer allowed to have request body because it does not have defined semantics as per RFC 7231.

## additional properties

Dictionaries, HashMaps and Associative Arrays
https://swagger.io/docs/specification/data-models/dictionaries/
