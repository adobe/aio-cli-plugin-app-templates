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
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:templates:remove', { provider: 'debug' })
const { removeTemplate } = require('../../lib/template-registry-helper')

class RemoveCommand extends BaseCommand {
  async run () {
    const { args } = this.parse(RemoveCommand)
    const templateName = args.name
    try {
      await this.login()
      aioLogger.debug('Retrieved Adobe IMS token')
      await removeTemplate(this.accessToken, templateName)
      this.log(`"${templateName}" has been successfully deleted from the Adobe App Builder Template Registry.`)
    } catch (err) {
      this.error(err.toString())
    }
  }
}

RemoveCommand.description = 'Remove an Adobe Developer App Builder template from the Template Registry'

RemoveCommand.examples = [
  'aio templates:remove @adobe/app-builder-template'
]

RemoveCommand.aliases = ['templates:r']

RemoveCommand.args = [
  {
    name: 'name',
    description: 'The name of the package implementing the template on npmjs.com',
    required: true
  }
]

RemoveCommand.flags = {
  ...BaseCommand.flags
}

module.exports = RemoveCommand
