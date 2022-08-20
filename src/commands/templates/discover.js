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
const ora = require('ora')
const { Flags, CliUx: { ux: cli } } = require('@oclif/core')
const inquirer = require('inquirer')
const { TEMPLATE_PACKAGE_JSON_KEY, readPackageJson } = require('../../lib/npm-helper')
const { getTemplates } = require('../../lib/template-registry-helper')
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:templates:discover', { provider: 'debug' })
const loadConfig = require('@adobe/aio-cli-lib-app-config')
const sdk = require('@adobe/aio-lib-console')
const env = require('@adobe/aio-lib-env')
const LibConsoleCLI = require('@adobe/aio-cli-lib-console')

class DiscoverCommand extends BaseCommand {
  async __install (templates) {
    const spinner = ora()

    const packageJson = await readPackageJson()
    const installedTemplates = packageJson[TEMPLATE_PACKAGE_JSON_KEY] || []
    aioLogger.debug(`installedTemplates: ${JSON.stringify(installedTemplates, null, 2)}`)

    const appConfig = loadConfig({})
    const orgId = appConfig?.aio?.project?.org?.id
    await this.login()
    const apiKey = env.getCliEnv() === 'prod' ? 'aio-cli-console-auth' : 'aio-cli-console-auth-stage'
    const consoleCLI = await LibConsoleCLI.init({ accessToken: this.accessToken, env: env.getCliEnv(), apiKey: apiKey })
    const orgSupportedServices = await consoleCLI.getEnabledServicesForOrg(orgId)
    const supportedServiceCodes = new Set(orgSupportedServices.map(s => s.code))
    const inqChoices = templates
      .filter(elem => { // remove any installed templates from the list
        aioLogger.debug(`elem (filter): ${elem}`)
        return !installedTemplates.includes(elem.name)
      })
      .map(elem => { // map to expected inquirer format
        aioLogger.debug(`elem (map): ${elem}`)
        let isDisabled = false
        if(typeof elem.apis !== 'undefined') {
          isDisabled = !elem.apis.map(api => api.code).every(code => supportedServiceCodes.has(code))
        }
        return {
          name: `${elem.name}@${elem.latestVersion}`,
          value: elem.name,
          disabled: isDisabled
        }
      })

    if (!inqChoices.length) {
      this.log('All available templates appear to be installed.')
      return []
    }

    const response = await inquirer.prompt([{
      name: 'templates',
      message: 'Select templates to install',
      type: 'checkbox',
      choices: inqChoices
    }])

    // install the templates in sequence
    for (const template of response.templates) {
      spinner.info(`Installing template ${template}`)
      await this.config.runCommand('templates:install', [template])
      spinner.succeed(`Installed template ${template}`)
    }

    return response.templates
  }

  async __list (templates) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }

    const columns = {
      name: {
        width: 10,
        get: row => `${row.name}`
      },
      version: {
        minWidth: 10,
        get: row => `${row.latestVersion}`
      },
      description: {
        get: row => `${row.description}`
      },
      publishDate: {
        header: 'Publish Date',
        get: row => `${new Date(row.publishDate).toLocaleDateString('en', options)}`
      },
      adobeRecommended: {
        header: 'Adobe Recommended',
        get: row => row.adobeRecommended ? 'yes' : ''
      }
    }
    cli.table(templates, columns)
  }

  async run () {
    const { flags } = await this.parse(DiscoverCommand)
    const spinner = ora()

    try {
      const searchCriteria = {
        statuses: ['Approved']
      }
      const orderByCriteria = {
        [flags['sort-field']]: flags['sort-order']
      }
      spinner.start()
      const templates = await getTemplates(searchCriteria, orderByCriteria)
      aioLogger.debug(`Retrieved templates: ${JSON.stringify(templates, null, 2)}`)
      spinner.stop()

      if (flags.interactive) {
        return this.__install(templates)
      } else {
        return this.__list(templates)
      }
    } catch (error) {
      spinner.stop()
      this.error('Oops:' + error)
    }
  }
}

DiscoverCommand.description = 'Discover App Builder templates to install'

DiscoverCommand.aliases = ['templates:disco']

DiscoverCommand.flags = {
  ...BaseCommand.flags,
  interactive: Flags.boolean({
    char: 'i',
    default: false,
    description: 'interactive install mode'
  }),
  'sort-field': Flags.string({
    char: 'f',
    default: 'adobeRecommended',
    options: ['publishDate', 'names', 'adobeRecommended'],
    description: 'which column to sort, use the sort-order flag to specify sort direction'
  }),
  'sort-order': Flags.string({
    char: 'o',
    default: 'desc',
    options: ['asc', 'desc'],
    description: 'sort order for a column, use the sort-field flag to specify which column to sort'
  })
}

module.exports = DiscoverCommand
