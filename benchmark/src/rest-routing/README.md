# REST routing benchmark

This directory contains a simple benchmarking to measure the performance of two
router implementations for REST APIs. See
https://loopback.io/doc/en/lb4/Routing-requests.html for more information.

- [TrieRouter](https://github.com/strongloop/loopback-next/tree/master/packages/rest/src/router/trie-router.ts)
- [RegExpRouter](https://github.com/strongloop/loopback-next/tree/master/packages/rest/src/router/regexp-router.ts)

## Basic use

```sh
npm run -s benchmark:routing // default to 1000 routes
npm run -s benchmark:routing -- <number-of-routes>
```

## Base lines

```
name                 duration    count    found   missed
TrieRouter          0,1453883       10        8        2
RegExpRouter        0,1220030       10        8        2

name                 duration    count    found   missed
TrieRouter          0,2109957       40       35        5
RegExpRouter        0,8762936       40       35        5

name                 duration    count    found   missed
TrieRouter          0,4895252      160      140       20
RegExpRouter       0,52156699      160      140       20

name                 duration    count    found   missed
TrieRouter         0,16065852      640      560       80
RegExpRouter      0,304921026      640      560       80

name                 duration    count    found   missed
TrieRouter         0,60165877     2560     2240      320
RegExpRouter      4,592089555     2560     2240      320
```
