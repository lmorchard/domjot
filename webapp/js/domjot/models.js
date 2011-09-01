//
// ## domjot models
//
define(["backbone", "underscore", "async", "domjot/utils", "domjot/models/sync"], 
        function (i1, i2, i3, utils, sync) {

    // ### Note model
    var Note = Backbone.Model.extend({
        
        // #### Blank HTML note template
        DOM_TMPL: ['',
            '<section class="note">',
                '<hgroup><h2></h2></hgroup>',
                '<div class="body"></div>',
            '</section>',
        ''].join("\n"),

        sync: sync.dom.NoteCollectionDOMSync,
        
        uid: function () {
            // TODO: Make sure the uid isn't already attached to a note;
            // re-generate if found.
            return _.uniqueId('note-');
        }
    });

    // ### Collection of domjot Notes
    var NoteCollection = Backbone.Collection.extend({
        sync: sync.dom.NoteCollectionDOMSync,
        url: "notes",
        model: Note
    });

    return {
        Note: Note, 
        NoteCollection: NoteCollection,
        notes: new NoteCollection()
    };

});
