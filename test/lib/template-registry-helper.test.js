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

const { getTemplates, addTemplate, removeTemplate } = require('../../src/lib/template-registry-helper')
const templateRegistrySDK = require('@adobe/aio-lib-templates')

jest.mock('@adobe/aio-lib-templates')

beforeEach(() => {
  jest.clearAllMocks()
})

/**
 * Emulates returning page results.
 *
 * @param {Array.<Array.<object>>} pages Records returned by Template Registry
 * @yields {Promise<Array.<object>>}
 * @returns {object} Returns AsyncGenerator
 */
async function * createAsyncGenerator (pages) {
  for (const page of pages) {
    yield page
  }
}

describe('Getting templates', () => {
  afterEach(() => {
    delete process.env.TEMPLATE_REGISTRY_API_URL
    delete process.env.TEMPLATE_REGISTRY_API_VERSION
  })

  const template1 = { name: '@author1/app-builder-template1', latestVersion: '1.1.0', status: 'Approved', adobeRecommended: true }
  const template2 = { name: '@author1/app-builder-template2', latestVersion: '3.1.0', status: 'Approved', adobeRecommended: true }
  const template3 = { name: '@author2/app-builder-template1', latestVersion: '3.3.0', status: 'Approved', adobeRecommended: true }
  const template4 = { name: '@author3/app-builder-template1', latestVersion: '1.0.0', status: 'Approved', adobeRecommended: true }

  const searchCriteria = {
    statuses: ['Approved'],
    adobeRecommended: true
  }

  const orderByCriteria = {
    adobeRecommended: 'desc'
  }

  test('Multiple chunks of templates (paginated results)', async () => {
    const mockClient = {
      getTemplates: jest.fn().mockReturnValue(createAsyncGenerator([
        [template1, template2],
        [template3, template4]
      ]))
    }
    templateRegistrySDK.init.mockReturnValue(mockClient)
    await expect(getTemplates(searchCriteria, orderByCriteria)).resolves.toEqual(
      [template1, template2, template3, template4]
    )
    expect(mockClient.getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    expect(templateRegistrySDK.init).toHaveBeenCalledWith({ server: { } })
  })

  test('One chunk of templates', async () => {
    const mockClient = {
      getTemplates: jest.fn().mockReturnValue(createAsyncGenerator([
        [template1, template2]
      ]))
    }
    templateRegistrySDK.init.mockReturnValue(mockClient)
    await expect(getTemplates(searchCriteria, orderByCriteria)).resolves.toEqual(
      [template1, template2]
    )
    expect(mockClient.getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    expect(templateRegistrySDK.init).toHaveBeenCalledWith({ server: { } })
  })

  test('Overriding Template Registry API `url` and `version` config values', async () => {
    const url = 'https://360030-templateregistryapi.adobeioruntime.net'
    const version = 'v2'

    process.env.TEMPLATE_REGISTRY_API_URL = url
    process.env.TEMPLATE_REGISTRY_API_VERSION = version

    const mockClient = {
      getTemplates: jest.fn().mockReturnValue(createAsyncGenerator([
        [template1, template2]
      ]))
    }
    templateRegistrySDK.init.mockReturnValue(mockClient)
    await expect(getTemplates(searchCriteria, orderByCriteria)).resolves.toEqual(
      [template1, template2]
    )
    expect(mockClient.getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
    expect(templateRegistrySDK.init).toHaveBeenCalledWith({ server: { url, version } })
  })
})

describe('Adding template', () => {
  const template = { name: '@author1/app-builder-template1', latestVersion: '1.1.0', status: 'Approved', adobeRecommended: true }
  test('Add a template', async () => {
    const mockAccessToken = 'bowling'
    const mockClient = {
      auth: mockAccessToken,
      addTemplate: jest.fn().mockReturnValue(template)
    }
    const mockTemplateName = template.name
    const mockGithubRepoUrl = 'https://github.com/AmyJZhao/app-builder-template'
    templateRegistrySDK.init.mockReturnValue(mockClient)
    await expect(addTemplate(mockAccessToken, mockTemplateName, mockGithubRepoUrl)).resolves.toEqual(template)
    expect(mockClient.addTemplate).toHaveBeenCalledWith(mockTemplateName, mockGithubRepoUrl)
    expect(templateRegistrySDK.init).toHaveBeenCalledWith({ server: { }, auth: { token: mockAccessToken } })
  })
})

describe('Removing template', () => {
  const template = { name: '@author1/app-builder-template1', latestVersion: '1.1.0', status: 'Approved', adobeRecommended: true }
  test('Remove a template', async () => {
    const mockAccessToken = 'bowling'
    const mockClient = {
      auth: mockAccessToken,
      deleteTemplate: jest.fn()
    }
    const mockTemplateName = template.name
    templateRegistrySDK.init.mockReturnValue(mockClient)
    await expect(removeTemplate(mockAccessToken, mockTemplateName)).resolves.not.toThrow()
    expect(mockClient.deleteTemplate).toHaveBeenCalledWith(mockTemplateName)
    expect(templateRegistrySDK.init).toHaveBeenCalledWith({ server: { }, auth: { token: mockAccessToken } })
  })
})
