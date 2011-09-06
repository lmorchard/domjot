//
// ## DOM-backed sync handler for models
//
define(["extlib/jquery", "domjot/utils", "domjot/views", "domjot/models"], 
        function (i0, utils, views, models) {
    var $ = jQuery;

    // #### Blank HTML note template
    var DOM_TMPL = [
        '<section>',
            '<hgroup><h2><a href=""></a></h2></hgroup>',
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
        sync: NoteCollectionDOMSync,

        save: function (attrs, options) {
            models.BaseNote.prototype.save.call(this, attrs, options);
            if (this.isNew()) {
                this.attributes.id = utils.noteUID();
            }
        }

    });

    // ### Collection of Notes
    var NoteCollection = models.BaseNoteCollection.extend({
        sync: NoteCollectionDOMSync,
        model: Note,

        // #### Produce clean HTML source of the doc from the DOM
        extractHTMLSource: function () {
            
            // TODO: TiddlyWiki loads up the original page and munges that
            // source. Might be smarter to do that, since this seems to be
            // running into a lot of markup injected by addons and framework
            // code.
            //
            // I'm not super happy with the way TiddlyWiki does string munging
            // instead of DOM wrangling. Then again, there might be a reason
            // they're doing it that way.
            var cl = $($('html').clone());

            // Exclude all UI elements
            cl.find('.ui-only').remove();
            // Exclude <script> elements in <head> created by RequireJS
            cl.find('head script[data-requirecontext]').remove();
            // Exclude any QUnit markup, which appears during testing
            cl.find('.qunit').remove();
            // HACK: Seems like some Firebug stuff sneaks in there
            // TODO: Maybe need a whitelist of what makes it in? Maybe grab
            // just the <article> and rebuild the surrounding HTML?
            cl.find('style:contains("firebug")').remove();
            
            return [
                "<!DOCTYPE html>\n",
                "<html>\n", cl.html(), "</html>"
            ].join(''); 
        }

    });

    return {
        NoteCollectionDOMSync: NoteCollectionDOMSync,
        Note: Note, 
        NoteCollection: NoteCollection,
        notes: new NoteCollection()
    };

});
