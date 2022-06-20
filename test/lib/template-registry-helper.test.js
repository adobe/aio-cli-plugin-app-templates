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
// const { when } = require('jest-when')

jest.mock('@adobe/aio-lib-templates')

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
  })
})
/*
describe('Adding templates', () => {
  const template = {
    "id": "d1dc1000-f32e-4172-a0ec-9b2f3ef6ac47",
    "author": "Adobe Inc.",
    "name": "@author/app-builder-template-1",
    "status": "InVerification",
    "description": "A template for testing purposes",
    "latestVersion": "1.0.0",
    "publishDate": "2022-05-01T03:50:39.658Z",
    "adobeRecommended": true,
    "keywords": [
        "aio",
        "adobeio",
        "app",
        "templates",
        "aio-app-builder-template"
    ],
    "links": {
        "npm": "https://www.npmjs.com/package/@author/app-builder-template-1",
        "github": "https://github.com/author/app-builder-template-1"
    },
    "categories": [
        "action",
        "ui"
    ],
    "runtime": true,
    "extension": {
        "serviceCode": "dx/excshell/1"
    },
    "apis": [
        {
            "code": "AnalyticsSDK",
            "credentials": "OAuth"
        },
        {
            "code": "CampaignStandard"
        },
        {
            "code": "Runtime"
        },
        {
            "code": "Events",
            "hooks": [
                {
                    "postdeploy": "some command"
                }
            ]
        },
        {
            "code": "Mesh",
            "endpoints": [
                {
                    "my-action": "https://some-action.com/action"
                }
            ]
        }
    ],
    "event": {
      "provder": "event-provider"
    },
    "reviewLink": "https://github.com/adobe/aio-template-submission/issues"
  }
  const mockClient = {
    addTemplate: jest.fn().mockReturnValue(template)
  }
  const mockAccessToken = "mockAccessToken"
  const mockTemplateName = "@author/app-builder-template-1"
  const mockGithubRepoUrl = "https://github.com/author/app-builder-template-1"
  when(templateRegistrySDK.init).calledWith(mockAccessToken).mockReturnValue(mockClient)
  await expect(addTemplate(mockAccessToken, mockTemplateName, mockGithubRepoUrl)).resolves.toEqual(template)
  expect(mockClient.addTemplate).toHaveBeenCalledWith(mockAccessToken, mockTemplateName, mockGithubRepoUrl)
})
*/