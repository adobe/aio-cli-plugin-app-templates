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

const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-app-templates:lib-template-registry-helper', { provider: 'debug' })
const templateRegistrySDK = require('@adobe/aio-lib-templates')

/**
 * Returns templates from Template Registry satisfying provided criterias.
 *
 * @param {object} searchCriteria Search Criteria
 * @param {object} orderByCriteria OrderBy Criteria
 * @returns {Promise.Array<object>} An array of templates from Template Registry.
 */
async function getTemplates (searchCriteria, orderByCriteria) {
  const templates = []
  const templateRegistryClient = templateRegistrySDK.init()
  aioLogger.debug('Getting templates from Template Registry ...')
  for await (const items of templateRegistryClient.getTemplates(searchCriteria, orderByCriteria)) {
    templates.push(...items)
  }
  aioLogger.debug(`Retrieved templates: ${JSON.stringify(templates, null, 2)}`)
  return templates
}

module.exports = {
  getTemplates
}
