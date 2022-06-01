# aio-cli-plugin-boilerplate
Basic working repo structure for Adobe teams to use as a starting point for their own plugins, and available as a github template to the @adobe github org.

## How to use this template

- create a new repo from the github.com/adobe and select it in the templates
- give it a unique name ( plugins are typically named aio-cli-plugin-xxxx )
- enter a description
- pick options
- create repository
- `git clone`, `npm i`
- make some changes to names of things readme, ...
- `git add .`
- `git commit -m 'A new begining'`

## How to use this repo, ( like a repo )

- Click 'Clone or Download' and download a zip
- extract it to a directory on your machine
- if you cloned, delete the hidden `.git` folder
- run `git init`
- make some changes to names of things readme, ...
- `git add .`
- `git commit -m 'A new begining'`

- Create the new empty repo here on github
- grab the remote url 

### back in your directory ...
- `git remote add origin new-repo-url`
- `git push origin master`

---

`PLUGINNAME` commands for the Adobe I/O CLI

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage
```sh-session
$ aio plugins:install @adobe/aio-cli-plugin-PLUGINNAME
$ # OR
$ aio discover -i
$ aio PLUGINNAME --help
```

# Commands
<!-- commands -->

<!-- commandsstop -->

## Contributing

Contributions are welcomed! Read the [Contributing Guide](CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
