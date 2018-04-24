# @loopback/cli

This module contains the experimental CLI for LoopBack 4.

## Installation

Run the following command to install the CLI.

`npm install -g @loopback/cli`

## Basic Use

1. To scaffold a LoopBack 4 application

   `lb4`

```sh
Usage:
  lb4 [options] [<name>]

Options:
  -h,   --help             # Print the generator's options and usage
        --skip-cache       # Do not remember prompt answers              Default: false
        --skip-install     # Do not automatically install dependencies   Default: false
        --applicationName  # Application name
        --description      # Description for the application
        --outdir           # Project root directory for the application
        --tslint           # Enable tslint
        --prettier         # Enable prettier
        --mocha            # Enable mocha
        --loopbackBuild    # Use @loopback/build

Arguments:
  name  # Project name for the application  Type: String  Required: false
```

2. To scaffold a LoopBack 4 extension

   `lb4 extension`

```sh
Usage:
  lb4 extension [options] [<name>]

Options:
  -h,   --help           # Print the generator's options and usage
        --skip-cache     # Do not remember prompt answers             Default: false
        --skip-install   # Do not automatically install dependencies  Default: false
        --description    # Description for the extension
        --outdir         # Project root directory for the extension
        --tslint         # Enable tslint
        --prettier       # Enable prettier
        --mocha          # Enable mocha
        --loopbackBuild  # Use @loopback/build
        --componentName  # Component name
```

3. To scaffold a controller into your application

```sh
  cd <your-project-directory>
  lb4 controller
```

```sh
Usage:
  lb4 controller [options] [<name>]

Options:
  -h,   --help            # Print the generator's options and usage
        --skip-cache      # Do not remember prompt answers             Default: false
        --skip-install    # Do not automatically install dependencies  Default: false
        --controllerType  # Type for the controller

Arguments:
  name  # Name for the controller  Type: String  Required: false
```

4. To download one of LoopBack example projects

   `lb4 example`

```sh
Usage:
  lb4 example [options] [<example-name>]

Options:
  -h,   --help           # Print the generator's options and usage
        --skip-cache     # Do not remember prompt answers             Default: false
        --skip-install   # Do not automatically install dependencies  Default: false
```

5. To list available commands

   `lb4 --commands` (or `lb4 -l`)

```sh
Available commands:
  lb4 app
  lb4 extension
  lb4 controller
  lb4 example
```

Please note `lb4 --help` also prints out available commands.

6. To print out version information

   `lb4 --version` (or `lb4 -v`)

```sh
@loopback/cli version: 0.8.0

@loopback/* dependencies:
  - @loopback/authentication: ^0.8.0
  - @loopback/boot: ^0.8.0
  - @loopback/build: ^0.5.0
  - @loopback/context: ^0.8.0
  - @loopback/core: ^0.6.0
  - @loopback/metadata: ^0.6.0
  - @loopback/openapi-spec-builder: ^0.5.0
  - @loopback/openapi-v3-types: ^0.4.0
  - @loopback/openapi-v3: ^0.7.0
  - @loopback/repository-json-schema: ^0.6.0
  - @loopback/repository: ^0.8.0
  - @loopback/rest: ^0.7.0
  - @loopback/testlab: ^0.7.0
  - @loopback/docs: ^0.5.0
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
