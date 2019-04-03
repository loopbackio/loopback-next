# REST routing benchmark

This directory contains a simple benchmarking to measure the performance of two
router implementations for REST APIs. See
https://loopback.io/doc/en/lb4/Routing-requests.html for more information.

- [TrieRouter](https://github.com/strongloop/loopback-next/tree/master/packages/rest/src/router/trie-router.ts)
- [RegExpRouter](https://github.com/strongloop/loopback-next/tree/master/packages/rest/src/router/regexp-router.ts)

## Basic use

```sh
npm run -s benchmark:routing // default to 1000 routes
npm run -s benchmark:routing -- <number-of-routes> <number-of-routes>
```

For example:

```
npm run -s benchmark:routing -- 10 40 160 640 2560
```

## Base lines

```
name                 duration    count    found   missed
TrieRouter          0,1038244       10        8        2
RegExpRouter        0,1002559       10        8        2


name                 duration    count    found   missed
TrieRouter           0,661415       40       35        5
RegExpRouter        0,5797990       40       35        5


name                 duration    count    found   missed
TrieRouter          0,2851976      160      140       20
RegExpRouter       0,27040556      160      140       20


name                 duration    count    found   missed
TrieRouter          0,8914005      640      560       80
RegExpRouter      0,330599418      640      560       80


name                 duration    count    found   missed
TrieRouter         0,45302321     2560     2240      320
RegExpRouter      5,471787942     2560     2240      320
```
