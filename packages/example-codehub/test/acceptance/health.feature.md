# Feature: Health

- In order to get the status of the API
- As a CodeHub devops api client
- I want to determine the health of the API
- So that I know the server is healthy

## Scenario: The Server is Up
- Given an API client
- When I make a request the `/health` endpoint
- Then it reponds with `200`
- And the `uptime` of the server

```
curl https://api.codehub.com/health

> GET / HTTP/1.1
> Host: api.codehub.com

{
  "uptime": $UPTIME_IN_MS
}
```
