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

const { flags } = require('@oclif/command')
const BaseCommand = require('../../BaseCommand')
const ora = require('ora')
const { cli } = require('cli-ux')
const inquirer = require('inquirer')
const { TEMPLATE_PACKAGE_JSON_KEY, readPackageJson } = require('../../lib/npm-helper')
const { getTemplates } = require('../../lib/template-registry-helper')
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:templates:discover', { provider: 'debug' })

class DiscoverCommand extends BaseCommand {
  async __install (templates) {
    const packageJson = await readPackageJson()
    const installedTemplates = packageJson[TEMPLATE_PACKAGE_JSON_KEY] || []
    aioLogger.debug(`installedTemplates: ${JSON.stringify(installedTemplates, null, 2)}`)

    const inqChoices = templates
      .filter(elem => { // remove any installed templates from the list
        aioLogger.debug(`elem (filter): ${elem}`)
        return !installedTemplates.includes(elem.name)
      })
      .map(elem => { // map to expected inquirer format
        aioLogger.debug(`elem (map): ${elem}`)
        return {
          name: `${elem.name}@${elem.latestVersion}`,
          value: elem.name
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
      await this.config.runCommand('templates:install', [template])
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
    const { flags } = this.parse(DiscoverCommand)
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
  interactive: flags.boolean({
    char: 'i',
    default: false,
    description: 'interactive install mode'
  }),
  'sort-field': flags.string({
    char: 'f',
    default: 'adobeRecommended',
    options: ['publishDate', 'names', 'adobeRecommended'],
    description: 'which column to sort, use the sort-order flag to specify sort direction'
  }),
  'sort-order': flags.string({
    char: 'o',
    default: 'desc',
    options: ['asc', 'desc'],
    description: 'sort order for a column, use the sort-field flag to specify which column to sort'
  })
}

module.exports = DiscoverCommand
