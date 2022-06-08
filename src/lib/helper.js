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

/**
 * Sort array values according to the sort order and/or sort-field.
 *
 * Note that this will use the Javascript sort() function, thus the values will
 * be sorted in-place.
 *
 * @param {Array<object>} values array of objects (with fields to sort by)
 * @param {object} [options] sort options to pass
 * @param {boolean} [options.descending] true by default, sort order
 * @param {string} [options.field] 'date' by default, sort field ('name', 'date' options)
 * @returns {Array<object>} the sorted values array (input values array sorted in place)
 */
function sortValues (values, { descending = true, field = 'date' } = {}) {
  const supportedFields = ['name', 'date']
  if (!supportedFields.includes(field)) { // unknown field, we just return the array
    return values
  }

  values.sort((left, right) => {
    const d1 = left[field]
    const d2 = right[field]

    if (descending) {
      return (d1 > d2) ? -1 : (d1 < d2) ? 1 : 0
    } else {
      return (d1 > d2) ? 1 : (d1 < d2) ? -1 : 0
    }
  })
  return values
}

module.exports = {
  sortValues
}
