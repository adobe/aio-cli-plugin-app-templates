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

const TheCommand = require('../../../src/commands/templates/discover')
const BaseCommand = require('../../../src/BaseCommand')

const { TEMPLATE_PACKAGE_JSON_KEY, readPackageJson } = require('../../../src/lib/npm-helper')
const inquirer = require('inquirer')
const { stdout } = require('stdout-stderr')
const { getTemplates } = require('../../../src/lib/template-registry-helper')

jest.mock('inquirer')
jest.mock('../../../src/lib/template-registry-helper')

jest.mock('../../../src/lib/npm-helper', () => {
  const orig = jest.requireActual('../../../src/lib/npm-helper')
  return {
    ...orig,
    readPackageJson: jest.fn()
  }
})

const searchCriteria = {
  statuses: ['Approved']
}

const now = new Date()
const tomorrow = new Date(now.valueOf() + 86400000)
const dayAfter = new Date(tomorrow.valueOf() + 86400000)
const templates = [
  { name: 'foo', description: 'some foo', latestVersion: '1.0.0', publishDate: now, adobeRecommended: true },
  { name: 'bar', description: 'some bar', latestVersion: '1.0.1', publishDate: tomorrow, adobeRecommended: true },
  { name: 'baz', description: 'some baz', latestVersion: '1.0.2', publishDate: dayAfter, adobeRecommended: false }
]

let command
let packageJson

beforeEach(() => {
  packageJson = {}
  console.error = jest.fn()
  readPackageJson.mockReset()
  getTemplates.mockReset()
  command = new TheCommand([])
  command.error = jest.fn()
  command.config = {
    runCommand: jest.fn()
  }

  readPackageJson.mockImplementation(() => {
    return packageJson
  })
})

test('exports', async () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof BaseCommand).toBeTruthy()
})

test('description', async () => {
  expect(TheCommand.description.length).toBeGreaterThan(0)
})

test('aliases', async () => {
  expect(TheCommand.aliases).toEqual(['templates:disco'])
})

test('flags', async () => {
  // from BaseComand
  expect(TheCommand.flags.verbose).toBeDefined()

  expect(TheCommand.flags.interactive).toBeDefined()
  expect(TheCommand.flags.interactive.type).toEqual('boolean')

  expect(TheCommand.flags['sort-field']).toBeDefined()
  expect(TheCommand.flags['sort-field'].type).toEqual('option')
  expect(TheCommand.flags['sort-field'].default).toEqual('adobeRecommended')

  expect(TheCommand.flags['sort-order']).toBeDefined()
  expect(TheCommand.flags['sort-order'].type).toEqual('option')
  expect(TheCommand.flags['sort-order'].default).toEqual('desc')
})

test('args', async () => {
  expect(TheCommand.args).toEqual([])
})

describe('sorting', () => {
  const genesis = new Date()
  const later = new Date(genesis.valueOf())
  later.setDate(later.getDate() + 10)

  test('unknown sort-field', async () => {
    command.argv = ['--sort-field', 'unknown']
    return new Promise((resolve, reject) => {
      return command.run()
        .then(() => {
          reject(new Error('it should not succeed'))
        })
        .catch(error => {
          expect(error.message).toMatch('Expected --sort-field=')
          resolve()
        })
    })
  })

  test('sort-field=names, ascending', async () => {
    getTemplates.mockReturnValue(templates)
    command.argv = ['--sort-field', 'names', '--sort-order', 'asc']
    const orderByCriteria = {
      names: 'asc'
    }
    return new Promise(resolve => {
      return command.run()
        .then(() => {
          expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
          const splitOutput = stdout.output.split('\n')
          expect(splitOutput[2]).toMatch('foo') // bar is first
          expect(splitOutput[3]).toMatch('bar') // foo is second
          resolve()
        })
    })
  })

  test('sort-field=names, descending', async () => {
    getTemplates.mockReturnValue(templates)
    command.argv = ['--sort-field', 'names', '--sort-order', 'desc']
    const orderByCriteria = {
      names: 'desc'
    }
    return new Promise(resolve => {
      return command.run()
        .then(() => {
          expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
          const splitOutput = stdout.output.split('\n')
          expect(splitOutput[2]).toMatch('foo') // foo is first
          expect(splitOutput[3]).toMatch('bar') // bar is second
          resolve()
        })
    })
  })

  test('sort-field=publishDate, ascending', async () => {
    getTemplates.mockReturnValue(templates)
    command.argv = ['--sort-field', 'publishDate', '--sort-order', 'asc']
    const orderByCriteria = {
      publishDate: 'asc'
    }
    return new Promise(resolve => {
      return command.run()
        .then(() => {
          expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
          const splitOutput = stdout.output.split('\n')
          expect(splitOutput[2]).toMatch('foo') // foo is first
          expect(splitOutput[3]).toMatch('bar') // bar is second
          resolve()
        })
    })
  })

  test('sort-field=publishDate, descending', async () => {
    getTemplates.mockReturnValue(templates)
    command.argv = ['--sort-field', 'publishDate', '--sort-order', 'desc']
    const orderByCriteria = {
      publishDate: 'desc'
    }
    return new Promise(resolve => {
      return command.run()
        .then(() => {
          expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
          const splitOutput = stdout.output.split('\n')
          expect(splitOutput[2]).toMatch('foo') // bar is first
          expect(splitOutput[3]).toMatch('bar') // foo is second
          resolve()
        })
    })
  })
})

describe('interactive install', () => {
  test('normal choices', async () => {
    getTemplates.mockReturnValue(templates)
    // default values for Order By
    const orderByCriteria = {
      adobeRecommended: 'desc'
    }

    command.argv = ['-i']
    inquirer.prompt = jest.fn().mockResolvedValue({
      templates: ['foo', 'bar']
    })

    packageJson = {
      [TEMPLATE_PACKAGE_JSON_KEY]: ['baz'] // existing template installed
    }

    return new Promise(resolve => {
      return command.run()
        .then((result) => {
          expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
          expect(result).toEqual(['foo', 'bar'])
          const arg = inquirer.prompt.mock.calls[0][0] // first arg of first call
          expect(arg[0].choices.map(elem => elem.value)).toEqual(['foo', 'bar']) // baz was an existing plugin, filtered out
          resolve()
        })
    })
  })

  test('all templates are already installed', async () => {
    getTemplates.mockReturnValue(templates)
    // default values for Order By
    const orderByCriteria = {
      adobeRecommended: 'desc'
    }

    command.argv = ['-i']
    inquirer.prompt = jest.fn().mockResolvedValue({
      templates: ['foo', 'bar', 'baz']
    })

    packageJson = {
      [TEMPLATE_PACKAGE_JSON_KEY]: ['bar', 'foo', 'baz'] // all the installed templates
    }

    return new Promise(resolve => {
      return command.run()
        .then((result) => {
          expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
          expect(result).toEqual([])
          expect(inquirer.prompt).not.toHaveBeenCalled() // should not prompt since there are no templates to install
          resolve()
        })
    })
  })

  test('no choices', async () => {
    getTemplates.mockReturnValue([])
    // default values for Order By
    const orderByCriteria = {
      adobeRecommended: 'desc'
    }

    command.argv = ['-i']
    inquirer.prompt = jest.fn().mockResolvedValue({
      templates: []
    })

    return new Promise(resolve => {
      return command.run()
        .then((result) => {
          expect(getTemplates).toHaveBeenCalledWith(searchCriteria, orderByCriteria)
          expect(result).toEqual([])
          resolve()
        })
    })
  })

  test('json result error', async () => {
    getTemplates.mockRejectedValueOnce({})

    command.argv = ['-i']

    return new Promise((resolve, reject) => {
      return command.run()
        .then(() => {
          expect(command.error).toHaveBeenCalled()
          resolve()
        })
        .catch(() => {
          reject(new Error('no error should have been thrown'))
        })
    })
  })
})
