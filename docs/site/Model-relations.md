- Relations are defined between models via relational properties on the source
  {model, repository}. The relation metadata from the relational property should be used to construct the constrained repository instance (we need the source instance, target repository and constraint to do so).
- The relational access needs to be configured/resolved between repositories.
  For example, a CustomerRepository and an OrderRepository are needed to perform
  CRUD operations for a given customer and his/her orders.
- Repository interfaces for relations define the available CRUD methods based on
  the relation type. Default relation repository classes implement those
  interfaces and enforce constraints on them using utility functions.
- We should support LB3 inclusion for related models which returns an array of
  related model instances as plain data objects. The array is populated only
  when the caller specifies the `includes` inside the filter. This would be a
  plural of the related model, in the case of customer has many orders, it would
  be `orders`.
- The metadata `as` from the relation decorators should be inferred from the
  relational property.
- Infer target repository when related models are backed by the same
  datasource, otherwise let user explicitly provide the target repository
- Remove `execute` function out of `Repository` interface and into its own
  interface for arbitrary SQL commands.
- Split `Repository` interface into different interfaces based on the
  persistence function type i.e. `LookupRepository` interface to have all the
  Retrieval methods, `WriteRepository` (I'm sure there is a better name), would
  have the create methods, `MutationRepository` might have the update and
  related methods (this might fall under the previous one), and
  DestroyRepository for deletes.
    - Explore the use of a mixin for a smart way of sharing the implementation
      bits from the different repositories.
