//
// ## domjot models
//
define(["jquery", "backbone", "underscore", "async", 
        "domjot/utils", "domjot/models/sync"], 
       function ($, i1, i2, i3, utils, sync) {

    // ### Base model for domjot models
    var BaseModel = Backbone.Model.extend({
        uid: function () {
            return 'obj-' + utils.uid();
        }
    });

    // ### Base collection for domjot models
    var BaseCollection = Backbone.Collection.extend({
    });

    // ### Note model
    var Note = BaseModel.extend({
        sync: sync.dom.NoteCollectionDOMSync,
        uid: function () {
            return 'note-' + utils.uid();
        },
        // #### Blank HTML note template
        DOM_TMPL: ['',
            '<section class="note">',
            '<header><h2></h2></header>',
            '<div class="body"></div>',
            '<footer></footer>',
            '</section>',
        ''].join("\n")
    });

    // ### Collection of domjot Notes
    var NoteCollection = BaseCollection.extend({
        sync: sync.dom.NoteCollectionDOMSync,
        url: "notes",
        model: Note
    });

    return {
        Note: Note, 
        NoteCollection: NoteCollection
    };

});
