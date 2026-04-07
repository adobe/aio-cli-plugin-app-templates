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

const aioLibConfig = require('@adobe/eslint-config-aio-lib-config')
const jestPlugin = require('eslint-plugin-jest')

module.exports = [
  ...aioLibConfig,
  {
    files: ['test/**/*.js', 'jest.setup.js'],
    ...jestPlugin.configs['flat/recommended']
  },
  {
    rules: {
      'jsdoc/no-defaults': 'off'
    }
  }
]
