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
        model: BaseNote
    });

    return {
        BaseNote: BaseNote, 
        BaseNoteCollection: BaseNoteCollection
    };

});
