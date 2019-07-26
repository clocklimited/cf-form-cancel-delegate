module.exports = createDelegate

const mapFormToObject = require('cf-map-form-to-object')
const modal = require('modal')
const isEqual = require('lodash.isequal')
const BaseModel = require('cf-base-model')

function createDelegate (debug, nofx) {
  return function formCancelDelegate (cb) {
    if (!this.initialModel) throw new Error('Model must have an initialModel property')

    // If the model has changed, warn user.
    const formData = mapFormToObject(this.$el.find('form'), this.model.schemata)
    const plainModel = this.model.toJSON ? this.model.toJSON() : this.model.attributes
    const newModel = (new BaseModel(Object.assign({}, plainModel, formData)).toJSON())
    const cbMode = typeof cb === 'function'

    debug('Cancelling', this.initialModel, newModel)

    // Model must have an initial model for this to work
    if (!isEqual(this.initialModel, newModel)) {
      modal(
        { title: 'You have unsaved changes',
          content: 'Would you like to continue editing, or discard these changes?',
          buttons:
          [ { text: 'Continue editing', event: 'continue', className: 'btn btn--success' },
            { text: 'Discard changes', event: 'discard', className: 'btn' }
          ],
          fx: !nofx
        })
        .on('discard', () => {
          if (cbMode) return cb(null, true)
          this.trigger('cancel')
        })
        .on('continue', () => { if (cbMode) cb(null, false) })
    } else {
      if (cbMode) return cb(null, true)
      this.trigger('cancel')
    }
  }
}
