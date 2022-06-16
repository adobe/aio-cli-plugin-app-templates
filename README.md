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
Discover, Install, Uninstall Adobe App Builder templates

---

<!-- toc -->
- [aio-cli-plugin-app-templates](#aio-cli-plugin-app-templates)
- [Usage](#usage)
- [Commands](#commands)
  - [`aio templates`](#aio-templates)
  - [`aio templates:discover`](#aio-templatesdiscover)
  - [`aio templates:info`](#aio-templatesinfo)
  - [`aio templates:install`](#aio-templatesinstall)
  - [`aio templates:rollback`](#aio-templatesrollback)
  - [`aio templates:uninstall`](#aio-templatesuninstall)
- [Contributing](#contributing)
- [Licensing](#licensing)
<!-- tocstop -->

# Usage
```sh-session
$ aio plugins:install @adobe/aio-cli-plugin-app-templates
$ # OR
$ aio discover -i
$ aio aio-cli-plugin-app-templates --help
```

# Commands
## `aio templates`

Discover, install, or uninstall a new template into an existing Adobe Developer App Builder App

```
USAGE
  $ aio templates

OPTIONS
  -v, --verbose  Verbose output

COMMANDS
  templates:discover   Discover App Builder templates to install
  templates:info       List all App Builder templates that are installed
  templates:install    Install an Adobe Developer App Builder template
  templates:rollback   Clears all installed templates
  templates:uninstall  Uninstall an Adobe Developer App Builder template
```
## `aio templates:discover`

Discover App Builder templates to install

```
USAGE
  $ aio templates:discover [-v] [-i] [-f publishDate|names|adobeRecommended] [-o asc|desc]

OPTIONS
  -f, --sort-field=<option>  [default: adobeRecommended] which column to sort, use the sort-order flag to specify sort direction
                             <options: publishDate|names|adobeRecommended>
  -i, --interactive          interactive install mode
  -o, --sort-order=<option>  [default: desc] sort order for a column, use the sort-field flag to specify which column to sort
                             <options: asc|desc>
  -v, --verbose              Verbose output

ALIASES
  $ aio templates:disco
```
## `aio templates:info`

List all App Builder templates that are installed

```
USAGE
  $ aio templates:info

OPTIONS
  -j, --json     output raw json
  -v, --verbose  Verbose output
  -y, --yml      output yml
```
## `aio templates:install`

Install an Adobe Developer App Builder template

```
USAGE
  $ aio templates:install PATH

ARGUMENTS
  PATH  path to the template (npm package name, file path, url). See examples

OPTIONS
  -v, --verbose  Verbose output

ALIASES
  $ aio templates:i

EXAMPLES
  aio templates:install https://github.com/org/repo
  aio templates:install git+https://github.com/org/repo
  aio templates:install ssh://github.com/org/repo
  aio templates:install git+ssh://github.com/org/repo
  aio templates:install file:../relative/path/to/template/folder
  aio templates:install file:/absolute/path/to/template/folder
  aio templates:install ../relative/path/to/template/folder
  aio templates:install /absolute/path/to/template/folder
  aio templates:install npm-package-name
  aio templates:install npm-package-name@tagOrVersion
  aio templates:install @scope/npm-package-name
  aio templates:install @scope/npm-package-name@tagOrVersion
```
## `aio templates:rollback`

Clears all installed templates

```
USAGE
  $ aio templates:rollback

OPTIONS
  -c, --[no-]confirm  confirmation needed for clear (defaults to true)
  -i, --interactive   interactive clear mode
  -l, --list          list templates that will be uninstalled
  -v, --verbose       Verbose output

ALIASES
  $ aio templates:rollb
```
## `aio templates:uninstall`

Uninstall an Adobe Developer App Builder template

```
USAGE
  $ aio templates:uninstall PACKAGE-NAME

ARGUMENTS
  PACKAGE-NAME  package name of the template

OPTIONS
  -v, --verbose  Verbose output

ALIASES
  $ aio templates:un
```

# Contributing

Contributions are welcomed! Read the [Contributing Guide](./CONTRIBUTING.md) for more information.

# Licensing

This project is licensed under the Apache V2 License. See [LICENSE](./LICENSE) for more information.
