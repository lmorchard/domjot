//
// ## DOM-backed sync handler for models
//
define(["jquery", "domjot/utils"], function ($, utils) {

    // ### Backbone sync backed by DOM
    var NoteCollectionDOMSync = function (method, model, options) {
        var self = arguments.callee;
        return self.methods[method].call(self.methods, model, options);
    }

    // ### Backbone sync methods against DOM
    NoteCollectionDOMSync.methods = {

        // #### Common method to update DOM content from model object
        _updateSectionFromNote: function (section, model) {
            section.attr('id', model.id)
                .find('header > h2').text(model.get('title')).end()
                .find('div.body').html(model.get('body')).end();
        },

        // #### Common method to update plain object from DOM content
        _extractDataFromSection: function (section, model) {
            var id = section.attr('id');
            if (!id) {
                id = model.prototype.uid();
                section.attr('id', id);
            }
            var item = {
                id: id,
                title: section.find('header > h2').text().trim(),
                body: section.find('div.body').html()
            };
            return item;
        },

        // #### Read notes from DOM
        read: function (c_or_m, options) {
            var self = this,
                model = (c_or_m.model) ? c_or_m.model : c_or_m,
                items = $('body > article > section')
                    .map(function (idx, el) {
                        return self._extractDataFromSection($(el), model);
                    })
                    .get();
            options.success(items);
        },

        // #### Create note section in DOM
        create: function (model, options) {
            var new_section = $(model.DOM_TMPL).appendTo('body > article');
            model.set({ id: model.uid() });
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

    return {
        NoteCollectionDOMSync: NoteCollectionDOMSync
    };
});
