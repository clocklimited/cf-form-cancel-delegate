const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>')

global.window = dom.window

global.window.$ = window.jQuery = global.jQuery = global.$ = require('./jquery-3.2.1.min.js')
global.document = window.document
global.window._ = global._ = require('lodash')
global.document = global.window.document
global.window.Backbone = global.Backbone = require('backbone')
global.window.Backbone.$ = global.window.jQuery
global.window.Backbone._ = global.window._
global.navigator = { userAgent: 'node.js' }
global.window.jade = require('jade/runtime')
global.addEventListener = window.addEventListener
global.addEventListener = global.window.addEventListener
