//
// ## DOM-backed sync handler for models
//
define(["extlib/jquery", "domjot/utils", "domjot/views"], 
        function (i0, utils, views) {
    var $ = jQuery;

    // #### Blank HTML note template
    var DOM_TMPL = ['',
        '<section class="note">',
            '<hgroup><h2></h2></hgroup>',
            '<div class="body"></div>',
        '</section>',
    ''].join("\n");

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
            var new_section = $(DOM_TMPL).appendTo('body > article');
            model.set({ id: model.uid() });
            utils.updateElementFromModel(new_section, model);
            options.success(model);
        },

        // #### Update note section in DOM
        "update": function (model, options) {
            var section = $("body > article > section[id='"+model.id+"']");
            utils.updateElementFromModel(section, model);
            options.success(model);
        },

        // #### Delete note section from DOM
        "delete": function (model, options) {
            var section = $("body > article > section[id='"+model.id+"']");
            section.remove();
            options.success(model);
        }

    };

    return {
        NoteCollectionDOMSync: NoteCollectionDOMSync
    };

});
