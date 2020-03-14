# @loopback/example-validation-app

An example application to demonstrate validation in LoopBack.

## Summary

This application shows how to add validation in a LoopBack application. It
exposes `/coffee-shops` endpoints to create/read/update/delete a `CoffeeShop`
instance with the in-memory storage.

### Key artifacts

1. [CoffeeShop model](src/models/coffee-shop.model.ts): Shows how to add
   validation using [AJV](https://www.npmjs.com/package/ajv).

   Example to limit length on a string:

   ```ts
   @property({
    type: 'string',
    required: true,
    // --- add jsonSchema -----
    jsonSchema: {
      maxLength: 10,
      minLength: 1,
    },
    // ------------------------
   })
   city: string;
   ```

2. [ValidatePhoneNumInterceptor](src/interceptors/validate-phone-num.interceptor.ts):
   interceptor that checks whether the area code of the phone number matches
   with the city name

3. [CoffeeShopController](src/controllers/coffee-shop.controller.ts): controller
   where the `ValidatePhoneNumInterceptor` is applied.

## Use

Start the app:

```sh
npm start
```

The application will listen on port 3000. Open http://localhost:3000/explorer in
your browser. You can try to test the validation for the `/coffee-shops`
endpoints.

## Testing validation at work

When calling `POST /coffee-shops` API, there are a few ways to test validation
is happening. An example of valid request body for `CoffeeShop` is:

```json
{
  "city": "Toronto",
  "phoneNum": "416-111-1111",
  "capacity": 10
}
```

However, the following examples of request body are not valid, and you'll be
getting an error with status code 422.

### Example 1: CoffeeShop.city length exceeds limit of 10

```json
{
  "city": "Toooooooooooronto",
  "phoneNum": "416-111-1111",
  "capacity": 10
}
```

### Example 2: CoffeeShop.phoneNum pattern is not "xxx-xxx-xxxx"

```json
{
  "city": "Toronto",
  "phoneNum": "4161111111",
  "capacity": 10
}
```

### Example 3: CoffeeShop.capacity value exceeds the limit of 100

```json
{
  "city": "Toronto",
  "phoneNum": "416-111-1111",
  "capacity": 10000
}
```

### Example 4: CoffeeShop.phoneNum has area code not matching the city name

```json
{
  "city": "Toronto",
  "phoneNum": "999-111-1111",
  "capacity": 10
}
```

According to the logic set in
`src/interceptors/validate-phone-num.interceptor.ts`, if city name is `Toronto`,
the area code for the phone number should begin with `416` or `647`.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
