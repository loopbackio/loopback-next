# @loopback/example-graphql

An example application to demonstrate GraphQL integration for LoopBack 4 using
[@loopback/graphql](https://github.com/strongloop/loopback-next/tree/graphql/extensions/graphql).

## Try it out

```sh
npm start
```

You should see the following messages:

```sh
Server is running at http://[::1]:3000
Try http://[::1]:3000/graphql
```

Open http://127.0.0.1:3000/graphql in your browser to play with the GraphiQL.

![graphql-demo](graphql-demo.png)

1. Copy the query to the right panel:

```graphql
query GetRecipe1 {
  recipe(recipeId: "1") {
    title
    description
    ratings
    creationDate
    ratingsCount(minRate: 2)
    averageRating
    ingredients
    numberInCollection
  }
}
```

2. Click on the run icon:

```json
{
  "data": {
    "recipe": {
      "title": "Recipe 1",
      "description": "Desc 1",
      "ratings": [0, 3, 1],
      "creationDate": "2018-04-11T00:00:00.000Z",
      "ratingsCount": 1,
      "averageRating": 1.3333333333333333,
      "ingredients": ["one", "two", "three"],
      "numberInCollection": 1
    }
  }
}
```

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
