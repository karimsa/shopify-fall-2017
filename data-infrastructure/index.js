#!/usr/bin/env node

/**
 * index.js - shopijoin
 * 
 * Copyright (C) 2017 Karim Alibhai.
 * Licensed under MIT license.
 */

const fs = require('fs')
    , path = require('path')

if ( process.argv.length !== 6 && process.argv.length !== 7 ) {
  console.log('usage: shopijoin [type] <file_one> <file_two> <key_one> <key_two>')
  console.log('')
  console.log('Where [type] can be: inner or outer.')
  process.exit(-1)
}

// hold onto results
const results = []

;(async () => {
  // grab data
  let [
    _,
    __,
    type,
    fileA,
    fileB,
    keyA,
    keyB,
  ] = process.argv

  // default join type is inner
  if ( process.argv.length !== 7 ) {
    [
      type,
      fileA,
      fileB,
      keyA,
      keyB,
    ] = [
      'inner',
      type,
      fileA,
      fileB,
      keyA,
    ]
  }

  // fix type case
  type = type.toLowerCase()

  // only two valid joins
  if (!/(inner|outer)/.test(type)) {
    throw new Error(type + ' is not a valid join.')
  }

  // parse arrays, asyncishly
  let [
    arrA,
    arrB
  ] = await Promise.all([ fileA, fileB ].map(async filename => {
    // fix relative paths
    filename = filename[0] === '.' ? path.resolve(process.cwd(), filename) : filename

    // convert error to more sensible error message
    try {
      return JSON.parse(fs.readFileSync(filename, 'utf8'))
    } catch (err) {
      throw new Error('Failed to read and parse: ' + filename)
    }
  }))

  // make sure arrA is bigger
  if ( arrA.length < arrB.length ) {
    [arrA, arrB] = [arrB, arrA]
;   [keyA, keyB] = [keyB, keyA]
  }

  // create map out of smaller array - in O(n)
  const mapB = {}
  for (let i = 0; i < arrB.length; ++ i) {
    let id = arrB[i][keyB]
;   (mapB[id] = mapB[id] || []).push([arrB[i], i])
  }

  // create empty objects for each data type
  const tplA = {}
      , tplB = {}
  
  for ( let key in arrA[0] ) {
    if (arrA[0].hasOwnProperty(key)) {
      tplA[key] = null
    }
  }

  for ( let key in arrB[0] ) {
    if (arrB[0].hasOwnProperty(key)) {
      tplB[key] = null
    }
  }

  // async generatorish thing
  await Promise.all(arrA.map(async data => {
    const join = mapB[ data[keyA] ]

    // see if there's anything to join with
    if ( join instanceof Array ) {
      join.forEach(([row, index]) => {
        // just join the two rows together
        let result = Object.assign({}, data, row)

        // mark as visited
        arrB[index] = null

        // add to results
        results.push(result)
      })
    }

    // otherwise, for an outer join, print data but add valid
    // empty fields from other 'table'
    else if ( type === 'outer' ) {
      results.push(Object.assign({}, tplB, data))
    }
  }))

  // finally, also add the right-side
  if (type === 'outer') {
    for (let row of arrB) {
      if (row !== null) {
        results.push(Object.assign({}, tplA, row))
      }
    }
  }
})()
  // trim off the trailing comma, and end array
  .then(() => console.log(JSON.stringify(results, null, 2)))

  // un-async the error
  .catch(err => {
    console.error(err)
    process.exit(-1)
  })