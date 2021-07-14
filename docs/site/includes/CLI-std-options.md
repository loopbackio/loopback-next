<!-- prettier-ignore-start -->
{% if include.title != "no" %}
**Standard options**
{% endif %}
`-h, --help`
: Print the generator's options and usage.

`--skip-cache`
: Do not remember prompt answers. Default is false.

`--skip-install`
: Do not automatically install dependencies. Default is false.

`-c, --config`
: JSON file name or value to configure options

`--format`
: Format generated code using `npm run lint:fix`

For example,
```sh
lb4 app --config config.json
lb4 app --config '{"name":"my-app"}'
cat config.json | lb4 app --config stdin
lb4 app --config stdin < config.json
lb4 app --config stdin << EOF
> {"name":"my-app"}
> EOF
```

`-y, --yes`
: Skip all confirmation prompts with default or provided value
<!-- prettier-ignore-end -->
