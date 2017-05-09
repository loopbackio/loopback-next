# Repostory

Repository provides strong-typed CRUD operations of a domain model against the datasource.

# Generic repository interface

# Default implementation of CRUD repository

# Leverage loopback-datasource-juggler

# Create specific repository interfaces

# Bind repositories to the container

# Use repositories in a controller

## Inject a repository

@inject('repositories/customerRepo')

# Declare repositories in JSON/YAML

server/repositories.json
```json
{
  "customerRepo": {
    "dataSource": "mysql",
    "model": "Customer",
    "settings": {}
  }
}
```

# Other considerations

## Caching
## Security
## Tracing/monitoring/logging

# References
- https://martinfowler.com/eaaCatalog/repository.html
- https://msdn.microsoft.com/en-us/library/ff649690.aspx


