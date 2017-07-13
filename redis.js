'use strict'

const redis = require('redis')
const config = require('../env/config')

const client = redis.createClient(config.REDIS.port, config.REDIS.endpoint, {no_ready_check: true})

client.on('connect', function () {
  console.log('Intelligence REDIS Connect!')
})

module.exports = {
  generateKey: {
    string: function (key, callback) {
      let multi = client.multi()
      multi.set(key, key)
      multi.expire(key, 1)
      multi.exec(callback)
    }
  },
  exists: function (key, callback) {
    client.exists(key, callback)
  },
  insert: function (key, input, callback) {
    if (typeof input !== 'string') {
      input = JSON.stringify(input)
    }
    client.rpush(key, input, callback)
  },
  select: {
    range: function (key, callback) {
      client.lrange(key, 0, -1, callback)
    },
    score: function (key, callback) {
      client.get(key, callback)
    }
  },
  score: {
    incrby: function (key, value, callback) {
      client.incrby(key, value, callback)
    }
  },
  util: {
    rename: function () {
      client.keys('*', function (err, arr) {
        let multi = client.multi()

        for (var i in arr) {
          if (arr[i] === 'ElastiCacheMasterReplicationTimestamp') {
            continue
          }
          multi.rename('session:' + 1474383600 + ':' + arr[i])
        }
        multi.exec(function (err, res) {
          if (err) {
            console.log('하아 씨... : ', err)
          }
          console.log('res : ', res)
        })
      })
    }
  }
}
