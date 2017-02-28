# Feature: Redirecting HTTP requests

- In order to ensure all requests are made to HTTPS endpoints
- As a consumer of the API
- I want to be redirected to the HTTPS protocol
- So that my requests are secure

## Scenario: Any endpoint

- Given a client
- When I make a request to an HTTP URL
- Then I should be redirected to the same HTTPS URL

```
 curl -v http://api.codehub.com

> GET / HTTP/1.1
> Host: api.codehub.com
>
< HTTP/1.1 301 Moved Permanently
< Location: https://api.codehub.com/
```
