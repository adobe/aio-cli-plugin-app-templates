/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { stdout, stderr } = require('stdout-stderr')
const fs = jest.requireActual('fs')
const path = require('path')
const eol = require('eol')

jest.setTimeout(30000)

const fixturesFolder = path.join(__dirname, 'test/__fixtures__')
global.fixturePath = (file) => {
  return `${fixturesFolder}/${file}`
}
// helper for fixtures
global.fixtureFile = (output) => {
  return fs.readFileSync(global.fixturePath(output)).toString()
}
// helper for fixtures
global.fixtureJson = (output) => {
  return JSON.parse(fs.readFileSync(global.fixturePath(output)).toString())
}
// fixture matcher
expect.extend({
  toMatchFixture (received, argument) {
    const val = global.fixtureFile(argument)
    // eslint-disable-next-line jest/no-standalone-expect
    expect(eol.auto(received)).toEqual(eol.auto(val))
    return { pass: true }
  }
})

expect.extend({
  toMatchFixtureJson (received, argument) {
    const val = global.fixtureJson(argument)
    // eslint-disable-next-line jest/no-standalone-expect
    expect(received).toEqual(val)
    return { pass: true }
  }
})

// trap console log
beforeEach(() => { stdout.start(); stderr.start() })
afterEach(() => { stdout.stop(); stderr.stop() })
