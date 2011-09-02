//
// ## domjot models
//
define(["extlib/backbone", "extlib/underscore", "extlib/async",
        "domjot/utils", "domjot/models/domsync"], 
        function (i1, i2, i3, utils, domsync) {

    // ### Note model
    var Note = Backbone.Model.extend({
        sync: domsync.NoteCollectionDOMSync,
        uid: function () {
            return _.uniqueId('note-');
        }
    });

    // ### Collection of domjot Notes
    var NoteCollection = Backbone.Collection.extend({
        sync: domsync.NoteCollectionDOMSync,
        url: "notes",
        model: Note
    });

    return {
        Note: Note, 
        NoteCollection: NoteCollection,
        notes: new NoteCollection()
    };

});
