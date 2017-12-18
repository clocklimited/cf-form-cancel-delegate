require('./test-env')

const createFormCancelDelegate = require('../');
const assert = require('assert');
const BaseModel = require('cf-base-model');
const schemata = require('schemata');

const namedSchemata = properties => schemata({
  name: 'Test',
  properties
})

function noop() {}

describe('Form cancel delegate', () => {
  beforeEach(() => {
    $('body').empty()
  })

  test(
    'should error if the model does not have an initialModel property',
    () => {
      assert.throws(() => {
        createFormCancelDelegate(noop, true)()
      })
    }
  )

  test(
    'should trigger a cancel event on the view if the model has not changed',
    done => {
      const cancelDelegate = createFormCancelDelegate(noop, true);

      const Model = BaseModel.extend({
        schemata: namedSchemata({
          a: {
            type: Number
          }
        })
      });

      const model = new Model({
        a: 10
      });

      const $el = $(
        ['<div>',
          '  <form>',
          '    <input name="a" value="10"/>',
          '  </form>',
          '</div>'
        ].join(''));

      const view = new(window.Backbone.View.extend({
        initialize() {
          this.initialModel = this.model.toJSON()
        }
      }))({
        model,
        el: $el[0]
      });

      view.on('cancel', () => {
        done()
      })

      cancelDelegate.call(view)
    }
  )

  test('should show a modal if the model has changed', () => {
    const cancelDelegate = createFormCancelDelegate(noop, true);

    const Model = BaseModel.extend({
      schemata: namedSchemata({
        a: {
          type: Number
        }
      })
    });

    const model = new Model({
      a: 10
    });

    const $el = $(
      ['<div>',
        '  <form>',
        '    <input name="a" value="20"/>',
        '  </form>',
        '</div>'
      ].join(''));

    const view = new(window.Backbone.View.extend({
      initialize() {
        this.initialModel = this.model.toJSON()
      }
    }))({
      model,
      el: $el[0]
    });

    cancelDelegate.call(view)
    assert($('.modal-overlay').length)
  })

  test('should discard changes if discard button is pressed', done => {
    const cancelDelegate = createFormCancelDelegate(noop, true);

    const Model = BaseModel.extend({
      schemata: namedSchemata({
        a: {
          type: Number
        }
      })
    });

    const model = new Model({
      a: 10
    });

    const $el = $(
      ['<div>',
        '  <form>',
        '    <input name="a" value="20"/>',
        '  </form>',
        '</div>'
      ].join(''));

    const view = new(window.Backbone.View.extend({
      initialize() {
        this.initialModel = this.model.toJSON()
      }
    }))({
      model,
      el: $el[0]
    });

    cancelDelegate.call(view)
    view.on('cancel', () => {
      assert.deepEqual(view.model.toJSON(), view.initialModel)
      done()
    })

    $('.js-button').eq(1).trigger('click')
  })

  test(
    'should not emit the cancel event if continue editing button is pressed',
    done => {
      const cancelDelegate = createFormCancelDelegate(noop, true);

      const Model = BaseModel.extend({
        schemata: namedSchemata({
          a: {
            type: Number
          }
        })
      });

      const model = new Model({
        a: 10
      });

      const $el = $(
        ['<div>',
          '  <form>',
          '    <input name="a" value="20"/>',
          '  </form>',
          '</div>'
        ].join(''));

      const view = new(window.Backbone.View.extend({
        initialize() {
          this.initialModel = this.model.toJSON()
        }
      }))({
        model,
        el: $el[0]
      });

      cancelDelegate.call(view)
      view.on('cancel', () => {
        assert(false)
      })

      $('.js-button').eq(0).trigger('click')

      // Allow 20ms for view to have cancel event triggered
      setTimeout(done, 20)
    }
  )

  test('should detect changes on nested models', () => {
    const cancelDelegate = createFormCancelDelegate(noop, true);

    const Model = BaseModel.extend({
      schemata: namedSchemata({
        a: {
          type: Number
        }
      })
    });

    const model = new Model({
      a: 10,
      b: new Model({
        c: 30
      })
    });

    const $el = $(
      ['<div>',
        '  <form>',
        '    <input name="a" value="20"/>',
        '  </form>',
        '</div>'
      ].join(''));

    const view = new(window.Backbone.View.extend({
      initialize() {
        this.initialModel = this.model.toJSON()
      }
    }))({
      model,
      el: $el[0]
    });

    model.get('b').set('c', 40)

    cancelDelegate.call(view)
    assert($('.modal-overlay').length)
  })

  test(
    'should call a callback if passed and discard is clicked',
    done => {
      const cancelDelegate = createFormCancelDelegate(noop, true);

      const Model = BaseModel.extend({
        schemata: namedSchemata({
          a: {
            type: Number
          }
        })
      });

      const model = new Model({
        a: 10
      });

      const $el = $(
        ['<div>',
          '  <form>',
          '    <input name="a" value="20"/>',
          '  </form>',
          '</div>'
        ].join(''));

      const view = new(window.Backbone.View.extend({
        initialize() {
          this.initialModel = this.model.toJSON()
        }
      }))({
        model,
        el: $el[0]
      });

      cancelDelegate.call(view, (err, discard) => {
        if (err) return done(err)
        assert(discard)
        done()
      })

      $('.js-button').eq(1).trigger('click')
    }
  )

  test(
    'should call a callback if passed and continue is clicked',
    done => {
      const cancelDelegate = createFormCancelDelegate(noop, true);

      const Model = BaseModel.extend({
        schemata: namedSchemata({
          a: {
            type: Number
          }
        })
      });

      const model = new Model({
        a: 10
      });

      const $el = $(
        ['<div>',
          '  <form>',
          '    <input name="a" value="20"/>',
          '  </form>',
          '</div>'
        ].join(''));

      const view = new(window.Backbone.View.extend({
        initialize() {
          this.initialModel = this.model.toJSON()
        }
      }))({
        model,
        el: $el[0]
      });

      cancelDelegate.call(view, (err, discard) => {
        if (err) return done(err)
        assert(!discard)
        done()
      })

      $('.js-button').eq(0).trigger('click')
    }
  )

  test(
    'should  call a callback if passed and the model has not changed',
    done => {
      const cancelDelegate = createFormCancelDelegate(noop, true);

      const Model = BaseModel.extend({
        schemata: namedSchemata({
          a: {
            type: Number
          }
        })
      });

      const model = new Model({
        a: 10
      });

      const $el = $(
        ['<div>',
          '  <form>',
          '    <input name="a" value="10"/>',
          '  </form>',
          '</div>'
        ].join(''));

      const view = new(window.Backbone.View.extend({
        initialize() {
          this.initialModel = this.model.toJSON()
        }
      }))({
        model,
        el: $el[0]
      });

      cancelDelegate.call(view, (err, discard) => {
        if (err) return done()
        assert(discard)
        done()
      })
    }
  )
})
