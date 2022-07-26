/*
 * Copyright 2022 Adobe Inc. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const BaseCommand = require('../../BaseCommand')
const { runScript } = require('../../lib/helper')
const { writeObjectToPackageJson, readPackageJson, getNpmDependency, processNpmPackageSpec, TEMPLATE_PACKAGE_JSON_KEY } = require('../../lib/npm-helper')
const ora = require('ora')
const yeoman = require('yeoman-environment')
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:templates:install', { provider: 'debug' })
const { Flags } = require('@oclif/core')

// aio-lib-console-project-installation dependencies
const path = require('path')
const loadConfig = require('@adobe/aio-cli-lib-app-config')
const templateHandler = require('@adobe/aio-lib-console-project-installation')

class InstallCommand extends BaseCommand {
  async run () {
    const { args, flags } = await this.parse(InstallCommand)
    let templateName

    const spinner = ora()
    spinner.info(`Installing npm package ${args.path}`)
    await runScript('npm', process.cwd(), ['install', args.path])
    spinner.succeed(`Installed npm package ${args.path}`)

    const packageJson = await readPackageJson()
    aioLogger.debug(`read package.json: ${JSON.stringify(packageJson, null, 2)}`)

    const packageSpec = processNpmPackageSpec(args.path)
    if (packageSpec.url) {
      // if it's a url, we don't know the package name, so we have to do a reverse lookup
      [templateName] = await getNpmDependency({ urlSpec: packageSpec.url })
    } else {
      templateName = packageSpec.name
    }
    aioLogger.debug(`templateName: ${templateName}`)

    const env = yeoman.createEnv()
    spinner.info(`Running template ${templateName}`)

    const templateOptions = flags['template-options']
    const defaultOptions = {
      'skip-prompt': flags.yes,
      // do not prompt for overwrites
      force: true,
      // do not install dependencies as they have been installed already
      'skip-install': true
    }

    aioLogger.debug(`defaultOptions: ${JSON.stringify(defaultOptions)}`)
    aioLogger.debug(`flags['template-options']: ${JSON.stringify(templateOptions)}`)

    const templatePath = require.resolve(templateName, { paths: [process.cwd()] })
    const gen = env.instantiate(require(templatePath), {
      options: { ...defaultOptions, ...templateOptions }
    })
    await env.runGenerator(gen)
    spinner.succeed(`Finished running template ${templateName}`)

    if (flags['process-install-config']) {
      // Setup Developer Console App Builder project from template install.yml configuration file
      await this.setConsoleProjectConfig(templateName)
    }

    const installedTemplates = packageJson[TEMPLATE_PACKAGE_JSON_KEY] || []
    aioLogger.debug(`installed templates in package.json: ${JSON.stringify(installedTemplates, null, 2)}`)
    if (!installedTemplates.includes(templateName)) {
      installedTemplates.push(templateName)
      aioLogger.debug(`adding new installed templates into package.json: ${JSON.stringify(installedTemplates, null, 2)}`)
      await writeObjectToPackageJson({ [TEMPLATE_PACKAGE_JSON_KEY]: installedTemplates })
    } else {
      aioLogger.debug(`duplicate template, skipping: ${templateName}`)
    }
  }

  /**
   * Setup Developer Console App Builder project from template install.yml configuration file
   *
   * @private
   * @param {string} templateName
   */
  async setConsoleProjectConfig (templateName) {
    // 1. Get an API access token from the developer console & install.yml file path
    await this.login()

    const installConfigFile = path.join(
      process.cwd(),
      'node_modules',
      templateName,
      'install.yml'
    )
    // 2. Instantiate App Builder Template Manager
    const templateManager = await templateHandler.init(this.accessToken, installConfigFile)

    // 3. Install the template
    const appConfig = loadConfig({})
    const orgId = appConfig?.aio?.project?.org?.id
    const projectId = appConfig?.aio?.project?.id
    if (orgId && projectId) {
      await templateManager.installTemplate(orgId, projectId)
    } else {
      const errorMessage = 'Error installing template: Missing orgId or projectId in project configuration'
      aioLogger.error(errorMessage)
      throw new Error(errorMessage)
    }
  }
}

InstallCommand.description = 'Install an Adobe Developer App Builder template'

InstallCommand.examples = [
  'aio templates:install https://github.com/org/repo',
  'aio templates:install git+https://github.com/org/repo',
  'aio templates:install ssh://github.com/org/repo',
  'aio templates:install git+ssh://github.com/org/repo',
  'aio templates:install file:../relative/path/to/template/folder',
  'aio templates:install file:/absolute/path/to/template/folder',
  'aio templates:install ../relative/path/to/template/folder',
  'aio templates:install /absolute/path/to/template/folder',
  'aio templates:install npm-package-name',
  'aio templates:install npm-package-name@tagOrVersion',
  'aio templates:install @scope/npm-package-name',
  'aio templates:install @scope/npm-package-name@tagOrVersion'
]

InstallCommand.aliases = ['templates:i']

InstallCommand.args = [
  {
    name: 'path',
    description: 'path to the template (npm package name, file path, url). See examples',
    required: true
  }
]

InstallCommand.flags = {
  ...BaseCommand.flags,
  yes: Flags.boolean({
    description: 'Skip questions, and use all default values',
    default: false,
    char: 'y'
  }),
  'process-install-config': Flags.boolean({
    description: '[default: true] Process the template install.yml configuration file, defaults to true, to skip processing install.yml use --no-process-install-config',
    default: true,
    allowNo: true
  }),
  'template-options': Flags.string({
    description: 'Additional template options, as a base64-encoded json string',
    parse: input => {
      try {
        const decoded = Buffer.from(input, 'base64').toString('utf8')
        aioLogger.debug(`--template-options: ${input} decoded as ${decoded}`)
        return JSON.parse(decoded)
      } catch (e) {
        throw new Error(`--template-options: ${input} is not a base64 encoded JSON object.`)
      }
    },
    default: {}
  })
}

module.exports = InstallCommand
