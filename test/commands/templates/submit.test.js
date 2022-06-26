/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const TheCommand = require('../../../src/commands/templates/submit')
const BaseCommand = require('../../../src/BaseCommand')

const { stdout } = require('stdout-stderr')

const { addTemplate } = require('../../../src/lib/template-registry-helper')

jest.mock('../../../src/lib/template-registry-helper')
jest.mock('@adobe/aio-lib-ims', () => ({
  getToken: jest.fn(),
  context: {
    setCli: jest.fn()
  }
}))
let command
const mockAccessToken = 'mock-access-token'

beforeEach(() => {
  command = new TheCommand([])
  command.error = jest.fn()
  command.config = {
    runCommand: jest.fn()
  }
  command.login = jest.fn()
})

test('exports', async () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof BaseCommand).toBeTruthy()
})

test('description', async () => {
  expect(TheCommand.description.length).toBeGreaterThan(0)
})

test('aliases', async () => {
  expect(TheCommand.aliases).toEqual(['templates:s'])
})

test('flags', async () => {
  // from BaseComand
  expect(TheCommand.flags.verbose).toBeDefined()
})

test('args', async () => {
  expect(TheCommand.args).toBeDefined()
  expect(TheCommand.args).toBeInstanceOf(Array)
  expect(TheCommand.args.length).toEqual(2)

  expect(TheCommand.args[0].name).toEqual('name')
  expect(TheCommand.args[1].name).toEqual('githubRepoUrl')
})

describe('submitting a template', () => {
  const template = {
    name: 'foo',
    description: 'some foo',
    latestVersion: '1.0.0',
    status: 'Approved',
    adobeRecommended: true,
    reviewLink: 'https://github.com/adobe/aio-template-submission/issues/23124',
    links: {
      npm: 'https://www.npmjs.com/package/@adobe/foo',
      github: 'https://github.com/adobe/foo'
    }
  }
  test('submit a template', async () => {
    addTemplate.mockReturnValue(template)
    command.argv = [template.name, template.links.github]
    command.accessToken = mockAccessToken
    return command.run()
      .then(() => {
        expect(addTemplate).toHaveBeenCalledWith(mockAccessToken, template.name, template.links.github)
        expect(stdout.output).toMatch(`A new template "${template.name}" has been submitted to the Adobe App Builder Template Registry for review.\nIts current status is "In Review". Please use the "${template.reviewLink}" link to check the verification status.`)
      })
  })
})
