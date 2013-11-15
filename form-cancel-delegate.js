module.exports = createDelegate

var mapFormToObject = require('cf-map-form-to-object')
  , modal = require('modal')
  , isEqual = require('lodash.isequal')
  , extend = require('lodash.assign')

function createDelegate(debug, nofx) {

  return function formCancelDelegate() {

    if (!this.initialModel) {
      throw new Error('Model must have an initialModel property')
    }

    // If the model has changed, warn user.
    var formData = mapFormToObject(this.$el.find('form'), this.model.schemata.schema)
      , newModel = extend({}, this.model.attributes, formData)

    debug('Cancelling', this.initialModel, newModel)

    // Model must have an initial model for this to work
    if (!isEqual(this.initialModel, newModel)) {
      modal(
        { title: 'You have unsaved changes'
        , content: 'Would you like to continue editing, or discard these changes?'
        , buttons:
          [ { text: 'Discard changes', event: 'discard', className: '' }
          , { text: 'Continue editing', event: 'continue', className: 'btn-primary' }
          ]
        , fx: !nofx
        }).on('discard', function () { this.trigger('cancel') }.bind(this))
    } else {
      this.trigger('cancel')
    }

  }

}