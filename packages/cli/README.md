# @loopback/cli

This module contains the experimental CLI for LoopBack 4.

## Installation

Run the following command to install the CLI.

`npm install -g @loopback/cli`

## Basic Use

1.  To scaffold a LoopBack 4 application

    `lb4` (or `lb4 app`)

    ```sh
    Usage:
      lb4 [<name>] [options]

    Options:
      -h,   --help             # Print the generator's options and usage
            --skip-cache       # Do not remember prompt answers              Default: false
            --skip-install     # Do not automatically install dependencies   Default: false
            --force-install    # Fail on install dependencies error          Default: false
            --applicationName  # Application name
            --docker           # Include Dockerfile and .dockerignore
            --repositories     # Include repository imports and RepositoryMixin
            --services         # Include service-proxy imports and ServiceMixin
            --description      # Description for the application
            --outdir           # Project root directory for the application
            --tslint           # Enable tslint
            --prettier         # Enable prettier
            --mocha            # Enable mocha
            --loopbackBuild    # Use @loopback/build
            --vscode           # Use preconfigured VSCode settings
            --private          # Mark the project private (excluded from npm publish)
      -c,   --config           # JSON file name or value to configure options
      -y,   --yes              # Skip all confirmation prompts with default or provided value
            --format           # Format generated code using npm run lint:fix

    Arguments:
      name  # Project name for the application  Type: String  Required: false
    ```

2.  To scaffold a LoopBack 4 extension

    `lb4 extension`

    ```sh
    Usage:
      lb4 extension [<name>] [options]

    Options:
      -h,   --help           # Print the generator's options and usage
            --skip-cache     # Do not remember prompt answers             Default: false
            --skip-install   # Do not automatically install dependencies  Default: false
            --force-install  # Fail on install dependencies error         Default: false
            --componentName  # Component name
            --description    # Description for the extension
            --outdir         # Project root directory for the extension
            --tslint         # Enable tslint
            --prettier       # Enable prettier
            --mocha          # Enable mocha
            --loopbackBuild  # Use @loopback/build
            --vscode         # Use preconfigured VSCode settings
            --private        # Mark the project private (excluded from npm publish)
      -c,   --config         # JSON file name or value to configure options
      -y,   --yes            # Skip all confirmation prompts with default or provided value
            --format         # Format generated code using npm run lint:fix

    Arguments:
      name  # Project name for the extension  Type: String  Required: false
    ```

3.  To scaffold a Controller into your application

    ```sh
    cd <your-project-directory>
    lb4 controller
    ```

    ```sh
    Usage:
      lb4 controller [<name>] [options]

    Options:
      -h,   --help            # Print the generator's options and usage
            --skip-cache      # Do not remember prompt answers                                Default: false
            --skip-install    # Do not automatically install dependencies                     Default: false
            --force-install   # Fail on install dependencies error                            Default: false
      -c,   --config          # JSON file name or value to configure options
      -y,   --yes             # Skip all confirmation prompts with default or provided value
            --format          # Format generated code using npm run lint:fix
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
      lb4 datasource [<name>] [options]

    Options:
      -h,   --help           # Print the generator's options and usage
            --skip-cache     # Do not remember prompt answers                                Default: false
            --skip-install   # Do not automatically install dependencies                     Default: false
            --force-install  # Fail on install dependencies error                            Default: false
      -c,   --config         # JSON file name or value to configure options
      -y,   --yes            # Skip all confirmation prompts with default or provided value
            --format         # Format generated code using npm run lint:fix

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
      lb4 model [<name>] [options]

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
      lb4 repository [<name>] [options]

    Options:
      -h,   --help                 # Print the generator's options and usage
            --skip-cache           # Do not remember prompt answers                                Default: false
            --skip-install         # Do not automatically install dependencies                     Default: false
            --force-install        # Fail on install dependencies error                            Default: false
            --model                # A valid model name
            --id                   # A valid ID property name for the specified model
            --datasource           # A valid datasource name
            --repositoryBaseClass  # A valid repository base class                                 Default: DefaultCrudRepository
      -c,   --config               # JSON file name or value to configure options
      -y,   --yes                  # Skip all confirmation prompts with default or provided value
            --format               # Format generated code using npm run lint:fix

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
            --skip-cache     # Do not remember prompt answers                                Default: false
            --skip-install   # Do not automatically install dependencies                     Default: false
            --force-install  # Fail on install dependencies error                            Default: false
            --datasource     # A valid datasource name
      -c,   --config         # JSON file name or value to configure options
      -y,   --yes            # Skip all confirmation prompts with default or provided value
            --format         # Format generated code using npm run lint:fix

    Arguments:
      name  # Name for the service  Type: String  Required: false
    ```

8.  To download one of LoopBack example projects

    `lb4 example`

    ```sh
    Usage:
      lb4 example [<example-name>] [options]

    Options:
      -h,   --help           # Print the generator's options and usage
            --skip-cache     # Do not remember prompt answers                                Default: false
            --skip-install   # Do not automatically install dependencies                     Default: false
            --force-install  # Fail on install dependencies error                            Default: false
      -c,   --config         # JSON file name or value to configure options
      -y,   --yes            # Skip all confirmation prompts with default or provided value
            --format         # Format generated code using npm run lint:fix

    Arguments:
      example-name  # Name of the example to clone  Type: String  Required: false

    Available examples:
      todo: Tutorial example on how to build an application with LoopBack 4.
      todo-list: Continuation of the todo example using relations in LoopBack 4.
      hello-world: A simple hello-world Application using LoopBack 4.
      log-extension: An example extension project for LoopBack 4.
      rpc-server: A basic RPC server using a made-up protocol.
      soap-calculator: An example on how to integrate SOAP web services
      express-composition: A simple Express application that uses LoopBack 4 REST API.
      greeter-extension: An example showing how to implement the extension point/extension pattern.
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
            --skip-cache                 # Do not remember prompt answers                                Default: false
            --skip-install               # Do not automatically install dependencies                     Default: false
            --force-install              # Fail on install dependencies error                            Default: false
            --url                        # URL or file path of the OpenAPI spec
            --validate                   # Validate the OpenAPI spec                                     Default: false
            --promote-anonymous-schemas  # Promote anonymous schemas as models                           Default: false
      -c,   --config                     # JSON file name or value to configure options
      -y,   --yes                        # Skip all confirmation prompts with default or provided value
            --format                     # Format generated code using npm run lint:fix

    Arguments:
      url  # URL or file path of the OpenAPI spec  Type: String  Required: false
    ```

10. To generate a life cycle observer class

    ```sh
    cd <your-project-directory>
    lb4 observer
    ```

    ```sh
    Usage:
      lb4 observer [<name>] [options]

    Options:
      -h,   --help           # Print the generator's options and usage
            --skip-cache     # Do not remember prompt answers                                Default: false
            --skip-install   # Do not automatically install dependencies                     Default: false
            --force-install  # Fail on install dependencies error                            Default: false
            --group          # Name of the observer group for ordering
      -c,   --config         # JSON file name or value to configure options
      -y,   --yes            # Skip all confirmation prompts with default or provided value
            --format         # Format generated code using npm run lint:fix

    Arguments:
      name  # Name for the observer  Type: String  Required: false

    ```

11. To discover a model from a supported datasource

    ```sh
    cd <your-project-directory>
    lb4 discover
      lb4 discover [<name>] [options]

    Options:
      -h,    --help           # Print the generator's options and usage
             --skip-cache     # Do not remember prompt answers                                              Default: false
             --skip-install   # Do not automatically install dependencies                                   Default: false
             --force-install  # Fail on install dependencies error                                          Default: false
      -c,    --config         # JSON file name or value to configure options
      -y,    --yes            # Skip all confirmation prompts with default or provided value
             --format         # Format generated code using npm run lint:fix
      -ds,   --dataSource     # The name of the datasource to discover
             --views          # Boolean to discover views                                                   Default: true
             --schema         # Schema to discover
             --all            # Discover all models without prompting users to select                       Default: false
             --outDir         # Specify the directory into which the `model.model.ts` files will be placed

    Arguments:
      name  # Name for the discover  Type: String  Required: false
    ```

12. To list available commands

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

13. To print out version information

    `lb4 --version` (or `lb4 -v`)

    ```sh
    @loopback/cli version: 1.8.1

    @loopback/* dependencies:
      - @loopback/authentication: ^1.0.14
      - @loopback/boot: ^1.0.14
      - @loopback/build: ^1.3.1
      - @loopback/context: ^1.6.0
      - @loopback/core: ^1.1.7
      - @loopback/metadata: ^1.0.7
      - @loopback/openapi-spec-builder: ^1.0.7
      - @loopback/openapi-v3-types: ^1.0.7
      - @loopback/openapi-v3: ^1.2.3
      - @loopback/repository-json-schema: ^1.3.3
      - @loopback/repository: ^1.1.7
      - @loopback/rest: ^1.7.0
      - @loopback/testlab: ^1.0.7
      - @loopback/docs: ^1.9.1
      - @loopback/service-proxy: ^1.0.9
      - @loopback/http-caching-proxy: ^1.0.8
      - @loopback/http-server: ^1.1.7
      - @loopback/rest-explorer: ^1.1.10
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
