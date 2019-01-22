## Open questions

- How to test code migrated from strong-remoting and loopback (v3)? Do we want
  to copy existing tests over? Migrate them to async/await style? Don't bother
  with testing at all, use few acceptance-level tests only?

- How to split 2k+ lines of new (migrated) code into smaller chunks that will be
  easier to review?

- Should we register LB3 Models for dependency injection into LB4 code? Register
  them as repositories, models, services, or something else?

- Should we implement booting datasources from `datasources.json`? I see two
  obstacles:

  1. Datasources must be booted before models are attached.
  2. LB3 supports variable replacement in JSON config files using ENV vars but
     also `app.get(name)`. This may add unwanted complexity to our compat layer.

## By the way

- TypeScript does not support static index signature, which make it difficult to
  consume custom model methods. See
  https://github.com/Microsoft/TypeScript/issues/6480.

- I'd like us to extract the Booter contract into a standalone package so that
  v3compat and other similar extensions don't have to inherit entire boot and
  don't have to lock down a specific semver-major version of boot in extension
  dependencies. Instead, they should depend on the Booter contract only, this
  contract should not be changed so often (hopefully).
