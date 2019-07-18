module.exports = createDelegate

var mapFormToObject = require('cf-map-form-to-object')
  , modal = require('modal')
  , isEqual = require('lodash.isequal')
  , extend = require('lodash.assign')
  , BaseModel = require('cf-base-model')

function createDelegate(debug, nofx) {

  return function formCancelDelegate(cb) {

    if (!this.initialModel) throw new Error('Model must have an initialModel property')

    // If the model has changed, warn user.
    var formData = mapFormToObject(this.$el.find('form'), this.model.schemata.schema)
      , plainModel = this.model.toJSON ? this.model.toJSON() : this.model.attributes
      , newModel = (new BaseModel(extend({}, plainModel, formData)).toJSON())
      , cbMode = typeof cb === 'function'

    debug('Cancelling', this.initialModel, newModel)

    // Model must have an initial model for this to work
    if (!isEqual(this.initialModel, newModel)) {
      modal(
        { title: 'You have unsaved changes'
        , content: 'Would you like to continue editing, or discard these changes?'
        , buttons:
          [ { text: 'Continue editing', event: 'continue', className: 'btn btn--success' }
          , { text: 'Discard changes', event: 'discard', className: 'btn' }
          ]
        , fx: !nofx
        })
        .on('discard', function () {
          if (cbMode) return cb(null, true)
          this.trigger('cancel')
        }.bind(this))
        .on('continue', function () { if (cbMode) cb(null, false) })
    } else {
      if (cbMode) return cb(null, true)
      this.trigger('cancel')
    }

  }

}
