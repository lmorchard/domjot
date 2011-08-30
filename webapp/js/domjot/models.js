//
// ## domjot models
//
define(["jquery", "domjot/utils"], function ($, domjot_utils) {

    // ### Blank HTML note template
    var NOTE_TMPL = ['',
        '<section class="note">',
        '<header><h2></h2></header>',
        '<div class="body"></div>',
        '<footer></footer>',
        '</section>',
    ''].join("\n");

    // ### Base model for domjot models
    var BaseModel = Backbone.Model.extend({
        uid: function () {
            return 'obj-' + domjot_utils.uid();
        }
    });

    // ### Base collection for domjot models
    var BaseCollection = Backbone.Collection.extend({
    });

    // ### Backbone sync backed by DOM
    var NoteCollectionDOMSync = function (method, model, options) {
        return arguments.callee.methods[method](model, options);
    }

    // ### Backbone sync methods against DOM
    NoteCollectionDOMSync.methods = {

        // #### Common method to update DOM content from model object
        _updateSectionFromNote: function (section, model) {
            section.attr('id', model.id)
                .find('header > h2').text(model.get('title')).end()
                .find('div.body').html(model.get('body')).end();
        },

        // #### read notes from DOM
        read: function (model, options) {
            var items = $('body > article > section')
                .map(function (idx, el) {
                    var section = $(el);
                    var id = section.attr('id');
                    if (!id) {
                        id = Note.prototype.uid();
                        section.attr('id', id);
                    }
                    var item = {
                        id: id,
                        title: section.find('header > h2').text().trim(),
                        body: section.find('div.body').html()
                    };
                    return item;
                })
                .get();
            options.success(items);
        },

        // #### Create note section in DOM
        create: function (model, options) {
            var new_section = $(NOTE_TMPL).appendTo('body > article');
            model.set({ id: Note.prototype.uid() });
            this._updateSectionFromNote(new_section, model);
            options.success(model);
        },

        // #### Update note section in DOM
        update: function (model, options) {
            var section = $("body > article > section[id='"+model.id+"']");
            this._updateSectionFromNote(section, model);
            options.success(model);
        },

        // #### Delete note section from DOM
        delete: function (model, options) {
            var section = $("body > article > section[id='"+model.id+"']");
            section.remove();
            options.success(model);
        }

    }

    // ### Note model
    var Note = BaseModel.extend({
        sync: NoteCollectionDOMSync,
        uid: function () {
            return 'note-' + domjot_utils.uid();
        }
    });

    // ### Collection of domjot Notes
    var NoteCollection = BaseCollection.extend({
        sync: NoteCollectionDOMSync,
        url: "notes",
        model: Note
    });

    return {
        Note: Note, NoteCollection: NoteCollection
    };

});
