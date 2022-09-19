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

const TheCommand = require('../../../src/commands/templates/remove')
const BaseCommand = require('../../../src/BaseCommand')

const { stdout } = require('stdout-stderr')

const { removeTemplate } = require('../../../src/lib/template-registry-helper')

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
  expect(TheCommand.aliases).toEqual(['templates:rm'])
})

test('flags', async () => {
  // from BaseComand
  expect(TheCommand.flags.verbose).toBeDefined()
})

test('args', async () => {
  expect(TheCommand.args).toBeDefined()
  expect(TheCommand.args).toBeInstanceOf(Array)
  expect(TheCommand.args.length).toEqual(1)
  expect(TheCommand.args[0].name).toEqual('name')
})

test('remove a template', async () => {
  removeTemplate.mockResolvedValueOnce({})
  command.argv = ['mock-template-name']
  command.accessToken = mockAccessToken
  return command.run()
    .then(() => {
      expect(removeTemplate).toHaveBeenCalledWith(mockAccessToken, 'mock-template-name')
      expect(stdout.output).toMatch('"mock-template-name" has been successfully deleted from the Adobe App Builder Template Registry.')
    })
})

test('catch an error', async () => {
  removeTemplate.mockRejectedValueOnce({})
  command.argv = ['mock-template-name']
  command.accessToken = mockAccessToken
  return command.run()
    .then(() => {
      expect(command.error).toHaveBeenCalled()
    })
})
