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

const { Flags, CliUx: { ux: cli } } = require('@oclif/core')
const BaseCommand = require('../../BaseCommand')
const inquirer = require('inquirer')
const { prompt } = require('../../lib/helper')
const { readPackageJson, hideNPMWarnings, getNpmLocalVersion, TEMPLATE_PACKAGE_JSON_KEY } = require('../../lib/npm-helper')
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:templates:discover', { provider: 'debug' })

class RollbackCommand extends BaseCommand {
  /**
   * List the templates that are installed.
   *
   * @param {Array<object>} templates the installed templates
   */
  async __list (templates) {
    const columns = {
      template: {
        width: 10,
        get: row => `${row.name}`
      },
      version: {
        minWidth: 10,
        get: row => `${row.version}`
      }
    }

    cli.table(templates, columns)
  }

  /**
   * Clear the installed templates (uninstall all)
   *
   * @private
   * @param {Array<object>} templates the installed templates
   * @param {boolean} needsConfirm true to show confirmation prompt
   */
  async __clear (templates, needsConfirm, verbose) {
    await this.__list(templates)
    let doClear = true

    this.log() // newline

    if (needsConfirm) {
      doClear = await prompt(`Uninstall ${templates.length} template(s)?`)
    }

    if (doClear) {
      if (!verbose) {
        // Intercept the stderr stream to hide npm warnings
        hideNPMWarnings()
      }

      // uninstall the templates in sequence
      for (const template of templates) {
        await this.config.runCommand('templates:uninstall', [template.name])
      }
    }
  }

  /**
   * Clear the installed plugins, with an interactive uninstall.
   *
   * @private
   * @param {Array<ToUpdatePlugin>} plugins the plugins to update
   */
  async __interactiveClear (templates, verbose) {
    const inqChoices = templates
      .map(template => { // map to expected inquirer format
        return {
          name: `${template.name}@${template.version}`,
          value: template.name
        }
      })

    const response = await inquirer.prompt([{
      name: 'templates',
      message: 'Select templates to uninstall',
      type: 'checkbox',
      choices: inqChoices
    }])

    if (!verbose) {
      // Intercept the stderr stream to hide npm warnings
      hideNPMWarnings()
    }

    // uninstall the plugins in sequence
    for (const template of response.templates) {
      await this.config.runCommand('templates:uninstall', [template])
    }
  }

  /**
   * Command entry point
   *
   * @returns {Promise} promise that lists/interactive clear/clears the installed updates
   */
  async run () {
    const { flags } = await this.parse(RollbackCommand)
    const packageJson = await readPackageJson()
    const installedTemplates = packageJson[TEMPLATE_PACKAGE_JSON_KEY] || []
    const templates = []

    aioLogger.debug(`installed templates (from package.json): ${JSON.stringify(installedTemplates, null, 2)}`)

    // list is just the names, we query node_modules for the actual version
    for (const name of installedTemplates) {
      try {
        const version = await getNpmLocalVersion(name)
        templates.push({ name, version })
      } catch (e) {
        // might not be installed yet, just put a dummy version
        aioLogger.debug(`template not found (error or not npm installed yet), using 'unknown' version: ${e}`)
        templates.push({ name, version: 'unknown' })
      }
    }

    aioLogger.debug(`installed templates (processed with version): ${JSON.stringify(templates, null, 2)}`)
    if (templates.length === 0) {
      this.log('no installed templates to clear')
      return
    }

    if (flags.list) {
      return this.__list(templates)
    } else if (flags.interactive) {
      return this.__interactiveClear(templates, flags.verbose)
    } else {
      return this.__clear(templates, flags.confirm, flags.verbose)
    }
  }
}

RollbackCommand.description = 'Clears all installed templates'

RollbackCommand.flags = {
  ...BaseCommand.flags,
  interactive: Flags.boolean({
    char: 'i',
    default: false,
    description: 'interactive clear mode'
  }),
  list: Flags.boolean({
    char: 'l',
    default: false,
    description: 'list templates that will be uninstalled'
  }),
  confirm: Flags.boolean({
    char: 'c',
    default: true,
    description: 'confirmation needed for clear (defaults to true)',
    allowNo: true
  })
}

module.exports = RollbackCommand
