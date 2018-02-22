# @loopback/cli

This module contains the experimental CLI for LoopBack 4.

## Installation

Run the following command to install the CLI.

`npm install -g @loopback/cli`

## Usage

1. To scaffold a LoopBack 4 application

    `lb4`

```
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

```
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

```
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

```
Usage:
  lb4 example [options] [<example-name>]

Options:
  -h,   --help           # Print the generator's options and usage
        --skip-cache     # Do not remember prompt answers             Default: false
        --skip-install   # Do not automatically install dependencies  Default: false
```


# Tests

run `npm test` from the root folder.

# Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

# License

MIT
