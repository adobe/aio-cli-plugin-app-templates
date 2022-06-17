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
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:templates:submit', { provider: 'debug' })
const sdk = require('@adobe/aio-lib-templates')
const { retrieveAccessToken } = require('../../lib/login')
class SubmitCommand extends BaseCommand {
  async run () {
    const { args } = this.parse(SubmitCommand)
    let templateName = args.name
    let githubRepoUrl = args.githubRepoUrl
    let accessToken = await retrieveAccessToken()
    const templateRegistryClient = sdk.init(
    {
        'auth': {
            'token': accessToken
        }
    } )
    try {
      const template = await templateRegistryClient.addTemplate(templateName, githubRepoUrl)
      this.log(`A new template "${template.name}" has been successfully added to Adobe App Builder Template Registry.`);
      this.log(`Its status is "${sdk.TEMPLATE_STATUS_IN_VERIFICATION}". Please use the "${template.reviewLink}" link to check the verification status.`);
    } catch(err) {
      this.error(err.toString())
    }
  }
}

SubmitCommand.description = 'Install an Adobe Developer App Builder template'

SubmitCommand.examples = [
  'aio templates:submit @adobe/app-builder-template https://github.com/adobe/app-builder-template'
]

SubmitCommand.aliases = ['templates:s']

SubmitCommand.args = [
  {
    name: 'name',
    description: 'The name of the package implementing the template on npmjs.com',
    required: true
  },
  {
    name: 'githubRepoUrl',
    description: "A link to the Github repository containing the package's source code",
    required: true
  }
]

SubmitCommand.flags = {
  ...BaseCommand.flags
}

module.exports = SubmitCommand
