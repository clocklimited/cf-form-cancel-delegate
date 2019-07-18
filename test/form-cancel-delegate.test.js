require('./test-env')

var createFormCancelDelegate = require('../')
  , assert = require('assert')
  , BaseModel = require('cf-base-model')
  , schemata = require('schemata')

function noop() {}

describe('Form cancel delegate', function () {

  beforeEach(function () {
    $('body').empty()
  })

  it('should error if the model does not have an initialModel property', function () {
    assert.throws(function () {
      createFormCancelDelegate(noop, true)()
    })
  })

  it('should trigger a cancel event on the view if the model has not changed', function (done) {

    var cancelDelegate = createFormCancelDelegate(noop, true)
      , Model = BaseModel.extend({ schemata: schemata({ a: { type: Number } }) })
      , model = new Model({ a: 10 })
      , $el = $(
        [ '<div>'
        , '  <form>'
        , '    <input name="a" value="10"/>'
        , '  </form>'
        , '</div>'
        ].join(''))
      , view = new (window.Backbone.View.extend(
          { initialize: function () {
              this.initialModel = this.model.toJSON()
            }
          }))({ model: model, el: $el[0]  })

    view.on('cancel', function () {
      done()
    })

    cancelDelegate.call(view)

  })

  it('should call the toJSON() method if it exists on the model', function (done) {
    var isToJsonCalled = false
      , cancelDelegate = createFormCancelDelegate(noop, true)
      , Model = BaseModel.extend({ schemata: schemata({ a: { type: Number } }) })
      , model = new Model({ a: 10 })
      , $el = $(
        [ '<div>'
        , '  <form>'
        , '    <input name="a" value="10"/>'
        , '  </form>'
        , '</div>'
        ].join(''))
      , view = new (window.Backbone.View.extend(
          { initialize: function () {
              this.initialModel = this.model.toJSON()
            }
          }))({ model: model, el: $el[0]  })

          model.toJSON = function() {
            isToJsonCalled = true
            return model.attributes
          }

    view.on('cancel', function () {
      assert.equal(isToJsonCalled, true, 'toJSON has not been called')
      done()
    })

    cancelDelegate.call(view)

  })

  it('should show a modal if the model has changed', function () {

    var cancelDelegate = createFormCancelDelegate(noop, true)
      , Model = BaseModel.extend({ schemata: schemata({ a: { type: Number } }) })
      , model = new Model({ a: 10 })
      , $el = $(
        [ '<div>'
        , '  <form>'
        , '    <input name="a" value="20"/>'
        , '  </form>'
        , '</div>'
        ].join(''))
      , view = new (window.Backbone.View.extend(
          { initialize: function () {
              this.initialModel = this.model.toJSON()
            }
          }))({ model: model, el: $el[0] })

    cancelDelegate.call(view)
    assert($('.modal-overlay').length)

  })

  it('should discard changes if discard button is pressed', function (done) {

    var cancelDelegate = createFormCancelDelegate(noop, true)
      , Model = BaseModel.extend({ schemata: schemata({ a: { type: Number } }) })
      , model = new Model({ a: 10 })
      , $el = $(
        [ '<div>'
        , '  <form>'
        , '    <input name="a" value="20"/>'
        , '  </form>'
        , '</div>'
        ].join(''))
      , view = new (window.Backbone.View.extend(
          { initialize: function () {
              this.initialModel = this.model.toJSON()
            }
          }))({ model: model, el: $el[0] })

    cancelDelegate.call(view)
    view.on('cancel', function () {
      assert.deepEqual(view.model.toJSON(), view.initialModel)
      done()
    })

    $('.js-button').eq(1).trigger('click')

  })

  it('should not emit the cancel event if continue editing button is pressed', function (done) {

    var cancelDelegate = createFormCancelDelegate(noop, true)
      , Model = BaseModel.extend({ schemata: schemata({ a: { type: Number } }) })
      , model = new Model({ a: 10 })
      , $el = $(
        [ '<div>'
        , '  <form>'
        , '    <input name="a" value="20"/>'
        , '  </form>'
        , '</div>'
        ].join(''))
      , view = new (window.Backbone.View.extend(
          { initialize: function () {
              this.initialModel = this.model.toJSON()
            }
          }))({ model: model, el: $el[0] })

    cancelDelegate.call(view)
    view.on('cancel', function () {
      assert(false)
    })

    $('.js-button').eq(0).trigger('click')

    // Allow 20ms for view to have cancel event triggered
    setTimeout(done, 20)

  })

  it('should detect changes on nested models', function () {

    var cancelDelegate = createFormCancelDelegate(noop, true)
      , Model = BaseModel.extend({ schemata: schemata({ a: { type: Number } }) })
      , model = new Model({ a: 10, b: new Model({ c: 30 }) })
      , $el = $(
        [ '<div>'
        , '  <form>'
        , '    <input name="a" value="20"/>'
        , '  </form>'
        , '</div>'
        ].join(''))
      , view = new (window.Backbone.View.extend(
          { initialize: function () {
              this.initialModel = this.model.toJSON()
            }
          }))({ model: model, el: $el[0] })

    model.get('b').set('c', 40)

    cancelDelegate.call(view)
    assert($('.modal-overlay').length)

  })

  it('should call a callback if passed and discard is clicked', function (done) {

    var cancelDelegate = createFormCancelDelegate(noop, true)
      , Model = BaseModel.extend({ schemata: schemata({ a: { type: Number } }) })
      , model = new Model({ a: 10 })
      , $el = $(
        [ '<div>'
        , '  <form>'
        , '    <input name="a" value="20"/>'
        , '  </form>'
        , '</div>'
        ].join(''))
      , view = new (window.Backbone.View.extend(
          { initialize: function () {
              this.initialModel = this.model.toJSON()
            }
          }))({ model: model, el: $el[0] })

    cancelDelegate.call(view, function (err, discard) {
      if (err) return done(err)
      assert(discard)
      done()
    })

    $('.js-button').eq(1).trigger('click')

  })

  it('should call a callback if passed and continue is clicked', function (done) {

    var cancelDelegate = createFormCancelDelegate(noop, true)
      , Model = BaseModel.extend({ schemata: schemata({ a: { type: Number } }) })
      , model = new Model({ a: 10 })
      , $el = $(
        [ '<div>'
        , '  <form>'
        , '    <input name="a" value="20"/>'
        , '  </form>'
        , '</div>'
        ].join(''))
      , view = new (window.Backbone.View.extend(
          { initialize: function () {
              this.initialModel = this.model.toJSON()
            }
          }))({ model: model, el: $el[0] })

    cancelDelegate.call(view, function (err, discard) {
      if (err) return done(err)
      assert(!discard)
      done()
    })

    $('.js-button').eq(0).trigger('click')

  })

  it('should  call a callback if passed and the model has not changed', function (done) {

    var cancelDelegate = createFormCancelDelegate(noop, true)
      , Model = BaseModel.extend({ schemata: schemata({ a: { type: Number } }) })
      , model = new Model({ a: 10 })
      , $el = $(
        [ '<div>'
        , '  <form>'
        , '    <input name="a" value="10"/>'
        , '  </form>'
        , '</div>'
        ].join(''))
      , view = new (window.Backbone.View.extend(
          { initialize: function () {
              this.initialModel = this.model.toJSON()
            }
          }))({ model: model, el: $el[0]  })

    cancelDelegate.call(view, function (err, discard) {
      if (err) return done()
      assert(discard)
      done()
    })

  })

})
