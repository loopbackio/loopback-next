# Context binding benchmark

This directory contains a simple benchmarking to measure the performance of
different styles of context bindings.

## Basic use

```sh
npm run -s benchmark:context
```

For example:

```
npm run -s benchmark:context
```

## Base lines

| Test                      | Ops/sec   | Relative margin of error | Runs sampled | Count |
| ------------------------- | --------- | ------------------------ | ------------ | ----- |
| factory - getSync         | 1,282,238 | ±1.11%                   | 93           | 68537 |
| factory - get             | 1,222,587 | ±1.19%                   | 87           | 66558 |
| asyncFactory - get        | 362,457   | ±1.78%                   | 78           | 23284 |
| staticProvider - getSync  | 484,494   | ±1.04%                   | 92           | 26260 |
| staticProvider - get      | 475,130   | ±1.13%                   | 86           | 27435 |
| asyncStaticProvider - get | 339,359   | ±1.43%                   | 86           | 19046 |
| provider - getSync        | 368,127   | ±1.14%                   | 87           | 21162 |
| provider - get            | 366,649   | ±0.86%                   | 86           | 21358 |
| asyncProvider - get       | 291,054   | ±1.94%                   | 82           | 16557 |
