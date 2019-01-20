# @loopback/cli

This module contains the experimental CLI for LoopBack 4.

## Installation

Run the following command to install the CLI.

`npm install -g @loopback/cli`

## Basic Use

1.  To scaffold a LoopBack 4 application

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

2.  To scaffold a LoopBack 4 extension

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

3.  To scaffold a Controller into your application

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

4.  To scaffold a DataSource into your application

    ```sh
    cd <your-project-directory>
    lb4 datasource
    ```

    ```sh
    Usage:
      lb4 datasource [options] [<name>]

    Options:
      -h,   --help            # Print the generator's options and usage
            --connector       # Name of datasource connector

    Arguments:
      name  # Name for the datasource  Type: String  Required: true
    ```

5.  To scaffold a Model into your application

    ```sh
    cd <your-project-directory>
    lb4 model
    ```

    ```sh
    Usage:
      lb4 model [options] [<name>]

    Options:
      -h,   --help            # Print the generator's options and usage
            --base            # A valid base model

    Arguments:
      name  # Name for the model  Type: String  Required: true
    ```

6.  To scaffold a Repository into your application

    ```sh
    cd <your-project-directory>
    lb4 repository
    ```

    ```sh
    Usage:
      lb4 repository [options] [<name>]

    Options:
      -h,   --help           # Print the generator's options and usage
            --model          # A valid model name
            --id             # A valid ID property name for the specified model
            --datasource     # A valid datasource name

    Arguments:
      name  # Name for the repository   Type: String  Required: false
    ```

7.  To scaffold a Service into your application

    ```sh
    cd <your-project-directory>
    lb4 service
    ```

    ```sh
    Usage:
      lb4 service [<name>] [options]

    Options:
      -h,   --help           # Print the generator's options and usage
            --datasource     # A valid datasource name

    Arguments:
      name  # Name for the service  Type: String  Required: false
    ```

8.  To download one of LoopBack example projects

    `lb4 example`

    ```sh
    Usage:
      lb4 example [options] [<example-name>]

    Options:
      -h,   --help           # Print the generator's options and usage
            --skip-cache     # Do not remember prompt answers             Default: false
            --skip-install   # Do not automatically install dependencies  Default: false
    ```

9.  To generate artifacts from an OpenAPI spec into your application

    ```sh
    cd <your-project-directory>
    lb4 openapi
    ```

    ```sh
    Usage:
      lb4 openapi [<url>] [options]

    Options:
      -h,   --help                       # Print the generator's options and usage
            --url                        # URL or file path of the OpenAPI spec
            --validate                   # Validate the OpenAPI spec                                     Default: false
            --promote-anonymous-schemas  # Promote anonymous schemas as models                           Default: false

    Arguments:
      url  # URL or file path of the OpenAPI spec  Type: String  Required: false
    ```

10. To list available commands

    `lb4 --commands` (or `lb4 -l`)

    ```sh
    Available commands:
      lb4 app
      lb4 extension
      lb4 controller
      lb4 datasource
      lb4 model
      lb4 repository
      lb4 service
      lb4 example
      lb4 openapi
    ```

    Please note `lb4 --help` also prints out available commands.

11. To print out version information

    `lb4 --version` (or `lb4 -v`)

    ```sh
    @loopback/cli version: 1.5.1

    @loopback/* dependencies:
      - @loopback/authentication: ^1.0.10
      - @loopback/boot: ^1.0.10
      - @loopback/build: ^1.2.0
      - @loopback/context: ^1.4.1
      - @loopback/core: ^1.1.4
      - @loopback/metadata: ^1.0.4
      - @loopback/openapi-spec-builder: ^1.0.4
      - @loopback/openapi-v3-types: ^1.0.4
      - @loopback/openapi-v3: ^1.1.7
      - @loopback/repository-json-schema: ^1.2.7
      - @loopback/repository: ^1.1.3
      - @loopback/rest: ^1.5.3
      - @loopback/testlab: ^1.0.4
      - @loopback/docs: ^1.7.1
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
