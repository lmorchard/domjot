//
// ## domjot models
//
define(["extlib/backbone", "extlib/underscore", "extlib/async",
        "domjot/utils"], 
        function (i1, i2, i3, utils) {

    // ### Note model
    var BaseNote = Backbone.Model.extend({
    });
            
    // ### Collection of domjot Notes
    var BaseNoteCollection = Backbone.Collection.extend({
        url: "notes",
        model: BaseNote,

        // See also: http://ui.thoughtbot.com/assets/backbone-js-on-rails-thoughtbot-ebook-august-2011-sample.html
        filtered: function(criteria_fn) {
            return new this.constructor(this.select(criteria_fn));
        }
    });

    return {
        BaseNote: BaseNote, 
        BaseNoteCollection: BaseNoteCollection
    };

});
