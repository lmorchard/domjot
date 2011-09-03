//
// ## DOM-backed sync handler for models
//
define(["extlib/jquery", "domjot/utils", "domjot/views", "domjot/models"], 
        function (i0, utils, views, models) {
    var $ = jQuery;

    // #### Blank HTML note template
    var DOM_TMPL = [
        '<section>',
            '<hgroup><h2></h2></hgroup>',
            '<div class="body"></div>',
        '</section>'
    ].join('');

    // ### Backbone sync backed by DOM
    var NoteCollectionDOMSync = function (method, model, options) {
        var self = arguments.callee;
        return self.methods[method].call(self.methods, model, options);
    };

    // ### Backbone sync methods against DOM
    NoteCollectionDOMSync.methods = {

        // #### Read notes from DOM
        "read": function (c_or_m, options) {
            var self = this,
                model = (c_or_m.model) ? c_or_m.model : c_or_m,
                items = $('body > article > section')
                    .map(function (idx, el) {
                        return utils.extractDataFromElement($(el), model);
                    })
                    .get();
            options.success(items);
        },

        // #### Create note section in DOM
        "create": function (model, options) {
            var new_section = $(DOM_TMPL)
                .insertAfter('body > article > header');
            model.set({ id: utils.noteUID() });
            utils.updateElementFromModel(new_section, model, true);
            options.success(model);
        },

        // #### Update note section in DOM
        "update": function (model, options) {
            var section = $("body > article > section[id='"+model.id+"']");
            utils.updateElementFromModel(section, model, true);
            options.success(model);
        },

        // #### Delete note section from DOM
        "delete": function (model, options) {
            var section = $("body > article > section[id='"+model.id+"']");
            section.remove();
            options.success(model);
        }

    };

    // ### Note model
    var Note = models.BaseNote.extend({
        sync: NoteCollectionDOMSync
    });

    // ### Collection of Notes
    var NoteCollection = models.BaseNoteCollection.extend({
        sync: NoteCollectionDOMSync,
        model: Note,

        // #### Produce clean HTML source of the doc from the DOM
        extractHTMLSource: function () {
            var cl = $($('html').clone());
            // Exclude all UI elements
            cl.find('.ui-only').remove();
            // Exclude <script> elements in <head> created by RequireJS
            cl.find('head script[data-requirecontext]').remove();
            // Exclude any QUnit markup, which appears during testing
            cl.find('.qunit').remove();
            return [
                "<!DOCTYPE html>",
                "<html>", cl.html(), "</html>"
            ].join("\n"); 
        }

    });

    return {
        NoteCollectionDOMSync: NoteCollectionDOMSync,
        Note: Note, 
        NoteCollection: NoteCollection,
        notes: new NoteCollection()
    };

});
