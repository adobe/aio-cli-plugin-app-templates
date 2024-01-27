<!--
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->

# aio-cli-plugin-app-templates

Discover, Install, Uninstall, Submit, and Remove Adobe App Builder templates

---

[![License](https://img.shields.io/npm/l/@adobe/aio-cli-plugin-app-templates.svg)](https://github.com/adobe/aio-cli-plugin-app-templates/blob/main/package.json)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@adobe/aio-cli-plugin-app-templates.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-app-templates)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-cli-plugin-app-templates.svg)](https://npmjs.org/package/@adobe/aio-cli-plugin-app-templates)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-cli-plugin-app-templates/main.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-cli-plugin-app-templates/)
[![Github Issues](https://img.shields.io/github/issues/adobe/aio-cli-plugin-app-templates.svg)](https://github.com/adobe/aio-cli-plugin-app-templates/issues)
[![Github Pull Requests](https://img.shields.io/github/issues-pr/adobe/aio-cli-plugin-app-templates.svg)](https://github.com/adobe/aio-cli-plugin-app-templates/pulls) 



<!-- toc -->
* [aio-cli-plugin-app-templates](#aio-cli-plugin-app-templates)
* [Usage](#usage)
* [Commands](#commands)
* [Contributing](#contributing)
* [Licensing](#licensing)
<!-- tocstop -->

# Usage

```sh-session
aio plugins:install @adobe/aio-cli-plugin-app-templates
## OR
aio discover -i
aio aio-cli-plugin-app-templates --help
```

# Commands
<!-- commands -->
* [`aio templates`](#aio-templates)
* [`aio templates disco`](#aio-templates-disco)
* [`aio templates discover`](#aio-templates-discover)
* [`aio templates i PATH`](#aio-templates-i-path)
* [`aio templates info`](#aio-templates-info)
* [`aio templates install PATH`](#aio-templates-install-path)
* [`aio templates remove NAME`](#aio-templates-remove-name)
* [`aio templates rm NAME`](#aio-templates-rm-name)
* [`aio templates rollback`](#aio-templates-rollback)
* [`aio templates sub NAME GITHUBREPOURL`](#aio-templates-sub-name-githubrepourl)
* [`aio templates submit NAME GITHUBREPOURL`](#aio-templates-submit-name-githubrepourl)
* [`aio templates un PACKAGE-NAME`](#aio-templates-un-package-name)
* [`aio templates uninstall PACKAGE-NAME`](#aio-templates-uninstall-package-name)

## `aio templates`

Discover, install, or uninstall a new template into an existing Adobe Developer App Builder App

```
USAGE
  $ aio templates [-v]

FLAGS
  -v, --verbose  Verbose output

DESCRIPTION
  Discover, install, or uninstall a new template into an existing Adobe Developer App Builder App
```

_See code: [src/commands/templates/index.ts](https://github.com/adobe/aio-cli-plugin-app-templates/blob/2.0.3/src/commands/templates/index.ts)_

## `aio templates disco`

Discover App Builder templates to install

```
USAGE
  $ aio templates disco [-v] [-i] [-f publishDate|names|adobeRecommended] [-o asc|desc]

FLAGS
  -f, --sort-field=<option>  [default: adobeRecommended] which column to sort, use the sort-order flag to specify sort
                             direction
                             <options: publishDate|names|adobeRecommended>
  -i, --interactive          interactive install mode
  -o, --sort-order=<option>  [default: desc] sort order for a column, use the sort-field flag to specify which column to
                             sort
                             <options: asc|desc>
  -v, --verbose              Verbose output

DESCRIPTION
  Discover App Builder templates to install

ALIASES
  $ aio templates disco
```

## `aio templates discover`

Discover App Builder templates to install

```
USAGE
  $ aio templates discover [-v] [-i] [-f publishDate|names|adobeRecommended] [-o asc|desc]

FLAGS
  -f, --sort-field=<option>  [default: adobeRecommended] which column to sort, use the sort-order flag to specify sort
                             direction
                             <options: publishDate|names|adobeRecommended>
  -i, --interactive          interactive install mode
  -o, --sort-order=<option>  [default: desc] sort order for a column, use the sort-field flag to specify which column to
                             sort
                             <options: asc|desc>
  -v, --verbose              Verbose output

DESCRIPTION
  Discover App Builder templates to install

ALIASES
  $ aio templates disco
```

_See code: [src/commands/templates/discover.ts](https://github.com/adobe/aio-cli-plugin-app-templates/blob/2.0.3/src/commands/templates/discover.ts)_

## `aio templates i PATH`

Install an Adobe Developer App Builder template

```
USAGE
  $ aio templates i PATH [-v] [-y] [--install] [--process-install-config] [--template-options <value>]

ARGUMENTS
  PATH  path to the template (npm package name, file path, url). See examples

FLAGS
  -v, --verbose                      Verbose output
  -y, --yes                          Skip questions, and use all default values
      --[no-]install                 [default: true] Run npm installation after files are created
      --[no-]process-install-config  [default: true] Process the template install.yml configuration file, defaults to
                                     true, to skip processing install.yml use --no-process-install-config
      --template-options=<value>     Additional template options, as a base64-encoded json string

DESCRIPTION
  Install an Adobe Developer App Builder template

ALIASES
  $ aio templates i

EXAMPLES
  $ aio templates install https://github.com/org/repo

  $ aio templates install git+https://github.com/org/repo

  $ aio templates install ssh://github.com/org/repo

  $ aio templates install git+ssh://github.com/org/repo

  $ aio templates install file:../relative/path/to/template/folder

  $ aio templates install file:/absolute/path/to/template/folder

  $ aio templates install ../relative/path/to/template/folder

  $ aio templates install /absolute/path/to/template/folder

  $ aio templates install npm-package-name

  $ aio templates install npm-package-name@tagOrVersion

  $ aio templates install @scope/npm-package-name

  $ aio templates install @scope/npm-package-name@tagOrVersion
```

## `aio templates info`

List all App Builder templates that are installed

```
USAGE
  $ aio templates info [-v] [-y | -j] [-s]

FLAGS
  -j, --json               output raw json
  -s, --required-services  includes services required by a template in the output
  -v, --verbose            Verbose output
  -y, --yml                output yml

DESCRIPTION
  List all App Builder templates that are installed
```

_See code: [src/commands/templates/info.ts](https://github.com/adobe/aio-cli-plugin-app-templates/blob/2.0.3/src/commands/templates/info.ts)_

## `aio templates install PATH`

Install an Adobe Developer App Builder template

```
USAGE
  $ aio templates install PATH [-v] [-y] [--install] [--process-install-config] [--template-options <value>]

ARGUMENTS
  PATH  path to the template (npm package name, file path, url). See examples

FLAGS
  -v, --verbose                      Verbose output
  -y, --yes                          Skip questions, and use all default values
      --[no-]install                 [default: true] Run npm installation after files are created
      --[no-]process-install-config  [default: true] Process the template install.yml configuration file, defaults to
                                     true, to skip processing install.yml use --no-process-install-config
      --template-options=<value>     Additional template options, as a base64-encoded json string

DESCRIPTION
  Install an Adobe Developer App Builder template

ALIASES
  $ aio templates i

EXAMPLES
  $ aio templates install https://github.com/org/repo

  $ aio templates install git+https://github.com/org/repo

  $ aio templates install ssh://github.com/org/repo

  $ aio templates install git+ssh://github.com/org/repo

  $ aio templates install file:../relative/path/to/template/folder

  $ aio templates install file:/absolute/path/to/template/folder

  $ aio templates install ../relative/path/to/template/folder

  $ aio templates install /absolute/path/to/template/folder

  $ aio templates install npm-package-name

  $ aio templates install npm-package-name@tagOrVersion

  $ aio templates install @scope/npm-package-name

  $ aio templates install @scope/npm-package-name@tagOrVersion
```

_See code: [src/commands/templates/install.ts](https://github.com/adobe/aio-cli-plugin-app-templates/blob/2.0.3/src/commands/templates/install.ts)_

## `aio templates remove NAME`

Remove an Adobe Developer App Builder template from the Template Registry

```
USAGE
  $ aio templates remove NAME [-v]

ARGUMENTS
  NAME  The name of the package implementing the template on npmjs.com

FLAGS
  -v, --verbose  Verbose output

DESCRIPTION
  Remove an Adobe Developer App Builder template from the Template Registry

ALIASES
  $ aio templates rm

EXAMPLES
  $ aio templates remove @adobe/app-builder-template
```

_See code: [src/commands/templates/remove.ts](https://github.com/adobe/aio-cli-plugin-app-templates/blob/2.0.3/src/commands/templates/remove.ts)_

## `aio templates rm NAME`

Remove an Adobe Developer App Builder template from the Template Registry

```
USAGE
  $ aio templates rm NAME [-v]

ARGUMENTS
  NAME  The name of the package implementing the template on npmjs.com

FLAGS
  -v, --verbose  Verbose output

DESCRIPTION
  Remove an Adobe Developer App Builder template from the Template Registry

ALIASES
  $ aio templates rm

EXAMPLES
  $ aio templates remove @adobe/app-builder-template
```

## `aio templates rollback`

Clears all installed templates

```
USAGE
  $ aio templates rollback [-v] [-i] [-l] [-c]

FLAGS
  -c, --[no-]confirm  confirmation needed for clear (defaults to true)
  -i, --interactive   interactive clear mode
  -l, --list          list templates that will be uninstalled
  -v, --verbose       Verbose output

DESCRIPTION
  Clears all installed templates
```

_See code: [src/commands/templates/rollback.ts](https://github.com/adobe/aio-cli-plugin-app-templates/blob/2.0.3/src/commands/templates/rollback.ts)_

## `aio templates sub NAME GITHUBREPOURL`

Submit an Adobe Developer App Builder template

```
USAGE
  $ aio templates sub NAME GITHUBREPOURL [-v]

ARGUMENTS
  NAME           The name of the package implementing the template on npmjs.com
  GITHUBREPOURL  A link to the Github repository containing the package's source code

FLAGS
  -v, --verbose  Verbose output

DESCRIPTION
  Submit an Adobe Developer App Builder template

ALIASES
  $ aio templates sub

EXAMPLES
  $ aio templates submit @adobe/app-builder-template https://github.com/adobe/app-builder-template
```

## `aio templates submit NAME GITHUBREPOURL`

Submit an Adobe Developer App Builder template

```
USAGE
  $ aio templates submit NAME GITHUBREPOURL [-v]

ARGUMENTS
  NAME           The name of the package implementing the template on npmjs.com
  GITHUBREPOURL  A link to the Github repository containing the package's source code

FLAGS
  -v, --verbose  Verbose output

DESCRIPTION
  Submit an Adobe Developer App Builder template

ALIASES
  $ aio templates sub

EXAMPLES
  $ aio templates submit @adobe/app-builder-template https://github.com/adobe/app-builder-template
```

_See code: [src/commands/templates/submit.ts](https://github.com/adobe/aio-cli-plugin-app-templates/blob/2.0.3/src/commands/templates/submit.ts)_

## `aio templates un PACKAGE-NAME`

Uninstall an Adobe Developer App Builder template

```
USAGE
  $ aio templates un PACKAGE-NAME [-v]

ARGUMENTS
  PACKAGE-NAME  package name of the template

FLAGS
  -v, --verbose  Verbose output

DESCRIPTION
  Uninstall an Adobe Developer App Builder template

ALIASES
  $ aio templates un
```

## `aio templates uninstall PACKAGE-NAME`

Uninstall an Adobe Developer App Builder template

```
USAGE
  $ aio templates uninstall PACKAGE-NAME [-v]

ARGUMENTS
  PACKAGE-NAME  package name of the template

FLAGS
  -v, --verbose  Verbose output

DESCRIPTION
  Uninstall an Adobe Developer App Builder template

ALIASES
  $ aio templates un
```

_See code: [src/commands/templates/uninstall.ts](https://github.com/adobe/aio-cli-plugin-app-templates/blob/2.0.3/src/commands/templates/uninstall.ts)_
<!-- commandsstop -->

# Contributing

Contributions are welcomed! Read the [Contributing Guide](./CONTRIBUTING.md) for more information.

# Licensing

This project is licensed under the Apache V2 License. See [LICENSE](./LICENSE) for more information.
