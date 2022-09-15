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

const { getTemplateRequiredServices, getTemplateRequiredServiceNames } = require('../../src/lib/template-helper')
const templateHandler = require('@adobe/aio-lib-console-project-installation')
const path = require('path')

jest.mock('@adobe/aio-lib-console-project-installation')

describe('Getting services required by a template', () => {
  test('Getting services required by a template', () => {
    const npmPackageName = '@adobe/template'
    const templateConfigurationFile = path.join(process.cwd(), 'node_modules', npmPackageName, 'install.yml')
    const templateRequiredServices = { runtime: true, apis: [{ code: 'GraphQLServiceSDK' }, { code: 'AssetComputeSDK' }] }
    templateHandler.getTemplateRequiredServices.mockReturnValueOnce(templateRequiredServices)
    expect(getTemplateRequiredServices(npmPackageName)).toEqual(templateRequiredServices)
    expect(templateHandler.getTemplateRequiredServices).toBeCalledWith(templateConfigurationFile)
  })

  test('Getting a list of service names required by a template', () => {
    const npmPackageName = '@adobe/template'
    const templateRequiredServices = { runtime: true, apis: [{ code: 'GraphQLServiceSDK' }, { code: 'AssetComputeSDK' }] }
    templateHandler.getTemplateRequiredServices.mockReturnValueOnce(templateRequiredServices)
    expect(getTemplateRequiredServiceNames(npmPackageName)).toEqual(['runtime', 'GraphQLServiceSDK', 'AssetComputeSDK'])
  })

  test('Getting a list of service names required by a template with no services specified', () => {
    const npmPackageName = '@adobe/template'
    const templateRequiredServices = { runtime: false, apis: [] }
    templateHandler.getTemplateRequiredServices.mockReturnValueOnce(templateRequiredServices)
    expect(getTemplateRequiredServiceNames(npmPackageName)).toEqual([])
  })
})
