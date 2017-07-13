'use strict'

const run = require('iterator-runner')
const redis = require('redis')
var Event = {}

function Sheet (input) {
  this.uuid = input.uuid
  this.sid = input.sid
  this.path = input.dp
  this.query = input.qs
  this.evt_time = input.ct
  this.time_label = input.vt
  this.referrer = decodeURI(input.dr)
  this.lang_code = input.lc
  this.page_title = decodeURI(input.pt)
  this.category = input.ec
  this.action = input.ea
  this.label = input.el
  this.value = input.ev
  this.hostname = (function (hostname) {
    var host = decodeURI(hostname)
    // :를 제거하기 위해
    if (host.match('127.0.0.1') || host['localhost']) {
      return 'loopback'
    }
    return host
  })(input.hn)
}

function BeeKeeper () {}

Event.beeKeeper = function (req, res, next) {
  res.locals.beeKeeper = {
    'key': [req.query.sid, req.query.ec, req.query.ea, req.query.el].join(':'),
    'sheet': new Sheet(req.query)
  }

  run(function *() {
    try {
      var exist = yield redis.exists.bind(null, res.locals.beeKeeper.key)
      if (exist) {
        yield redis.score.event.incrby(each.hostname + ':event:block:' + each.category + ':' + each.action, 1, function (err, result) {})
        return res.sendStatus(200)
      }

      yield redis.generateKey.string.bind(null, res.locals.beeKeeper.key)
      yield redis.insert.bind(null, 'buffer:event', res.locals.beeKeeper.sheet)
      next()
    } catch (err) {
      return res.json({'err': err})
    }
  })
}

module.exports = Event
