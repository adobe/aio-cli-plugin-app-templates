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
Discover, Install Adobe App Builder templates

---

<!-- toc -->
- [aio-cli-plugin-app-templates](#aio-cli-plugin-app-templates)
- [Usage](#usage)
- [Commands](#commands)
  - [`aio templates`](#aio-templates)
  - [`aio templates:discover`](#aio-templatesdiscover)
  - [`aio templates:install`](#aio-templatesinstall)
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

Discover, or install a new template into an existing Adobe Developer App Builder App

```
USAGE
  $ aio templates

COMMANDS
  templates:discover  Discover App Builder templates to install
  templates:install   Install an Adobe Developer App Builder template
```
## `aio templates:discover`

Discover App Builder templates to install

```
USAGE
  $ aio templates:discover [-s <value>] [-i] [-f publishDate|names|adobeRecommended] [-o asc|desc]

FLAGS
  -f, --sort-field=<option>  [default: publishDate] which column to sort, use the sort-order flag to specify sort direction
                             <options: publishDate|names|adobeRecommended>
  -i, --interactive          interactive install mode
  -o, --sort-order=<option>  [default: desc] sort order for a column, use the sort-field flag to specify which column to sort
                             <options: asc|desc>
  -s, --scope=<value>        filter the templates by npm scope
```
## `aio templates:install`

Install an Adobe Developer App Builder template

```
USAGE
  $ aio templates:install [PATH]

ARGUMENTS
  PATH  path to the template (npm package name, file path, url). See examples

ALIASES
  $ aio app:template:i

EXAMPLES
  $ aio app:template:install https://github.com/org/repo
  $ aio app:template:install git+https://github.com/org/repo
  $ aio app:template:install ssh://github.com/org/repo
  $ aio app:template:install git+ssh://github.com/org/repo
  $ aio app:template:install file:../relative/path/to/template/folder
  $ aio app:template:install file:/absolute/path/to/template/folder
  $ aio app:template:install ../relative/path/to/template/folder
  $ aio app:template:install /absolute/path/to/template/folder
  $ aio app:template:install npm-package-name
  $ aio app:template:install npm-package-name@tagOrVersion
  $ aio app:template:install @scope/npm-package-name
  $ aio app:template:install @scope/npm-package-name@tagOrVersion
```

# Contributing

Contributions are welcomed! Read the [Contributing Guide](./CONTRIBUTING.md) for more information.

# Licensing

This project is licensed under the Apache V2 License. See [LICENSE](./LICENSE) for more information.
