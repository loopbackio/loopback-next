# Composite Keys

## Details

- Proposer(s): Rifa Achrinza @achrinza
- Affected packages: `@loopback/repository`

## Introduction

In database design, the identitify of an entity in a table is dictated by multiple primary keys. Some examples include:

- **Junction tables** - Junction tables are used as a bridge in a Many-Many relation. As such, "uniqueness" of each row is constrained by the fact that there can only be 1 Many-Many relation between any 2 tables.
- **Sub-entities** - "Sub-entities" are rows that are only unique within a constrained context instead of the whole database.

    For example, a "User" may have mulitple unique phone numbers, but the phone numbers may be reused across accounts. Hence, the primary key for a phone number is a combination of itself and the User's own primary key.

Currently, LoopBack 4 does not provide native support for composite keys. Hence, the aforementioned scenarios require workarounds through the use native queries, or another non-composite primary key which breaks the intended identity contract.

## Prior Art

### MikroORM

MikroORM introduces a Symbol whose Tuple Type is utilized for type inferrence:

```typescript
@Entity()
export class Car {

  @PrimaryKey()
  name: string;

  @PrimaryKey()
  year: number;

  [PrimaryKeyType]: [string, number]; // this is needed for proper type checks in `FilterQuery`

  constructor(name: string, year: number) {
    this.name = name;
    this.year = year;
  }
}
```

To query:

```typescript
const car = new Car('Audi A8', 2010);
await em.persistAndFlush(car);
```

To query, the

```typescript
const audi1 = await em.findOneOrFail(Car, { name: 'Audi A8', year: 2010 });
const audi2 = await em.findOneOrFail(Car, ['Audi A8', 2010]);
```

### Prisma

### TypeORM

### Waterline.js

## Proposed Solution

