/*
Copyright 2022 Adobe Inc. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Flags } = require('@oclif/core')
const yaml = require('js-yaml')
const chalk = require('chalk')
const BaseCommand = require('../../BaseCommand')
const { readPackageJson, getNpmLocalVersion, TEMPLATE_PACKAGE_JSON_KEY } = require('../../lib/npm-helper')
const { getTemplateRequiredServiceNames } = require('../../lib/template-helper')
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:templates:info', { provider: 'debug' })

class InfoCommand extends BaseCommand {
  indentString (string, count = 2, indent = ' ') {
    return `${indent.repeat(count)}${string}`
  }

  printTemplate (template, printRequiredServices = false, count = 0, indent = ' ') {
    let output = `${template.name}@${template.spec} (${chalk.gray(template.version)})`
    if (printRequiredServices) {
      output += ' Required services: ' + (template['required-services'].length > 0 ? template['required-services'].join(', ') : 'NONE')
    }
    this.log(this.indentString(output, count, indent))
  }

  async run () {
    const { flags } = await this.parse(InfoCommand)

    const packageJson = await readPackageJson()
    const installedTemplates = packageJson[TEMPLATE_PACKAGE_JSON_KEY] || []
    const templates = []

    aioLogger.debug(`installed templates (from package.json): ${JSON.stringify(installedTemplates, null, 2)}`)

    // list is just the names, we query node_modules for the actual version
    for (const name of installedTemplates) {
      const spec = packageJson.dependencies[name] || 'unknown'
      try {
        const version = await getNpmLocalVersion(name)
        const info = { name, version, spec }
        if (flags['required-services']) {
          info['required-services'] = getTemplateRequiredServiceNames(name)
        }
        templates.push(info)
      } catch (e) {
        // might not be installed yet, just put a dummy version
        aioLogger.debug(`template not found (error or not npm installed yet), using 'unknown' version: ${e}`)
        templates.push({ name, version: 'unknown', spec })
      }
    }

    if (flags.yml) {
      this.log(yaml.safeDump(templates))
    } else if (flags.json) {
      this.log(JSON.stringify(templates, null, 2))
    } else if (templates.length > 0) {
      for (const template of templates) {
        this.printTemplate(template, flags['required-services'])
      }
    } else {
      this.log('no app templates are installed')
    }
  }
}

InfoCommand.description = 'List all App Builder templates that are installed'

InfoCommand.flags = {
  ...BaseCommand.flags,
  json: Flags.boolean({
    char: 'j',
    description: 'output raw json',
    default: false
  }),
  yml: Flags.boolean({
    char: 'y',
    description: 'output yml',
    default: false,
    exclusive: ['json']
  }),
  'required-services': Flags.boolean({
    char: 's',
    description: 'includes services required by a template in the output',
    default: false
  })
}

module.exports = InfoCommand
