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

const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:lib-template-helper', { provider: 'debug' })
const templateHandler = require('@adobe/aio-lib-console-project-installation')
const path = require('path')

/**
 * Returns services required by a template.
 * For example:
 * { runtime: true, apis: [{ code: 'GraphQLServiceSDK' }, { code: 'AssetComputeSDK' }] }
 *
 * @param {string} npmPackageName a npm package name
 * @param {string} dir a root path of where node_modules is
 * @returns {object} an object with properties `runtime` and `apis`
 */
function getTemplateRequiredServices (npmPackageName, dir = process.cwd()) {
  const templateConfigurationFile = path.join(dir, 'node_modules', npmPackageName, 'install.yml')
  aioLogger.debug(`Getting services required by a template from ${templateConfigurationFile} ...`)
  const info = templateHandler.getTemplateRequiredServices(templateConfigurationFile)
  aioLogger.debug(`Retrieved services required by a template: ${JSON.stringify(info, null, 2)}`)
  return info
}

module.exports = {
  getTemplateRequiredServices
}
