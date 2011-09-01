//
// ## domjot views
//
define(["jquery", "backbone", "underscore", "async", "domjot/utils", "require"], 
        function ($, i1, i2, i3, utils, require) {

    var NOTE_KEY = "NoteView";

    // ### View wrapper for DOM notes.
    var NoteView = Backbone.View.extend({

        tagName: 'section', className: 'note',
        events: {
            "click .action-edit": "revealEditor"
        },

        // #### Update the DOM for a note
        render: function () {
            utils.updateElementFromModel($(this.el), this.model);
            return this;
        },

        // #### Extract note data from the DOM
        serialize: function () {
            return utils.extractDataFromElement($(this.el), this.model);
        },

        // #### Create and reveal an editor for this note
        revealEditor: function () {
            var editor = new NoteEditorView({
                model: this.model, 
                collection: this.collection
            });
            $(this.el).after(editor.el).hide();
            editor.render().delegateEvents();
            return false;
        },

        // #### Enable controls for the note
        enableControls: function () {
            if (this.$('nav.controls').length == 0) {
                this.$('hgroup').after(NoteView.CONTROLS_TMPL);
                this.delegateEvents();
            }
            return false;
        },

        // #### Remove controls for the note from DOM
        removeControls: function () {
            this.$('nav.controls').remove();
            return false;
        }

    }, {
        
        // #### Empty DOM template for note controls
        CONTROLS_TMPL: ['',
            '<nav class="controls"><ul>',
                '<li><a href="#" class="action-edit">Edit</a></li>',
            '</ul></nav>',
        ''].join("\n"),

        // #### Get a view for an element or ID
        get: function (el) {
            // Convert string to jQuery
            if (_.isString(el)) { el = $('#'+el); }
            // Convert element to jQuery
            else if (_.isElement(el)) { el = $(el[0]); }
            // Punt if there's no element at all.
            if (!el.length) { return null; }
            // Ensure NoteView instance is associated with jquery element data
            var view = el.data(NOTE_KEY);
            if (!view) {
                var models = require('domjot/models'),
                    notes = models.notes,
                    note = notes.get(el.attr('id'));
                view = new NoteView({
                    el: el, model: note, collection: notes
                });
                el.data(NOTE_KEY, view);
            }
            return view;
        }

    });

    // ### View for note editing
    var NoteEditorView = Backbone.View.extend({
        tagName: 'div', className: 'note-editor',

        events: {
            "click button[name=save]": "commit"
        },
        
        // #### Update the editor fields from the related model.
        render: function () {
            $(this.el).html(NoteEditorView.EDITOR_TMPL);
            this.$('h2').text(this.model.get('title'));
            this.$('*[name=title]').val(this.model.get('title'));
            this.$('*[name=body]').val(this.model.get('body'));
            return this;
        },

        // #### Extract data from editor fields.
        serialize: function () {
            return {
                title: this.$('*[name=title]').val(),
                body: this.$('*[name=body]').val(),
            }
        },

        // #### Commit the state of the editor to the related model.
        commit: function () {
            var data = this.serialize(),
                editor_el = $(this.el),
                model = this.model,
                display_view = NoteView.get(model.id);
            this.model.save(data, {
                success: function (model, resp) {
                    editor_el.remove();
                    $(display_view.el).show();
                },
                error: function (model, resp, options) {
                }
            });
            return false;
        }

    }, {
        
        // #### Template for the innerHTML of the editor div
        // TODO: Move this into an external asset? l10n?
        EDITOR_TMPL: ['',
            '<h2></h2>',
            '<form><fieldset>',
                '<ul>',
                    '<li class="field"><label>Title</label>',
                        '<input type="text" name="title" size="50" /></li>',
                    '<li class="field"><label>Body</label>',
                        '<textarea name="body" cols="50" rows="10"></textarea></li>',
                    '<li class="field"><label></label>',
                        '<button name="save">Save</button></li>',
                '</ul>',
            '</fieldset></form>',
        ''].join("\n"),

    });

    return {
        NoteView: NoteView,
        NoteEditorView: NoteEditorView
    };

});
