//
// ## domjot views
//
define(["extlib/jquery", "extlib/backbone", "extlib/underscore",
        "extlib/async", "domjot/utils", "domjot/models/domsync",
        "domjot/storage", "require"], 
        function (i0, i1, i2, i3, utils, models, storage, require) {
    var $ = jQuery;

    var NOTE_KEY = "NoteView";

    // ### Main app view
    var AppView = Backbone.View.extend({
        el: $('body > article'),
        tagname: 'article',

        events: {
            "click a": "linkClick",
            "click input#autosave": "toggleAutosave",
            "click button.newNote": "newNote",
            "click button.saveChanges": "saveChanges"
        },

        // #### Initialize the app.
        initialize: function (options) {
            var $this = this;

            this.options = _.extend({
                notes: models.notes,
                fade_time: 250,
                save_delay: 500,
                confirm_delete: true,
                animations: true,
                success: function () {},
                error: function () {}
            }, options || {});

            this.notes = this.options.notes;

            // Fetch all notes from the document.
            this.notes.fetch({
                success: function () {
                    $this.render();
                    $this.options.success($this);
                },
                error: function (resp) {
                    $this.options.error($this, err);
                }
            });

            // Schedule autosave on significant model events
            var save_triggers = ['add', 'change', 'destroy', 'remove'];
            this.notes.bind('all', function (ev_name) {
                if ($this.options.autosave && 
                        save_triggers.indexOf(ev_name) != -1) {
                    $this.scheduleSave();
                }
            });

        },

        // #### Render the app and enable controls.
        render: function () {
            var $this = this;
            this.$('> section').each(function () { 
                $this.getNoteView(this)
                    .render()
                    .enableControls(); 
            });
            this.enableControls();
            return this;
        },

        // #### Enable controls for the app.
        enableControls: function () {
            if (this.$('> header > menu.controls').length === 0) {
                this.$('> header').prepend(AppView.CONTROLS_TMPL);
                this.delegateEvents();
            }
            return false;
        },

        // #### Get a section by anchor name or by ID
        sectionByNameOrID: function (name) {
            var section = this.$('section#'+name);
            if (!section.length) {
                section = this.$('a[name="'+name+'"]').parents('section');
            }
            return section;
        },

        // #### Get a NoteView for an element
        getNoteView: function (el) {
            if (!el) { return null; }
            // Convert string to jQuery
            if (_.isString(el)) { el = $('#'+el); }
            // Convert element to jQuery
            else if (_.isElement(el)) { el = $(el); }
            // Punt if there's no element at all.
            if (!el.length) { return null; }
            // Ensure NoteView instance is associated with jquery element data
            var view = el.data(NOTE_KEY);
            if (!view) {
                view = new NoteView({
                    el: el, 
                    model: this.notes.get(el.attr('id')), 
                    collection: this.notes, 
                    appview: this
                });
                el.data(NOTE_KEY, view);
            }
            return view;
        },

        // #### Create a new note and reveal its editor.
        newNote: function (ev, title, body) {
            var $this = this;
            
            title = title || "New note";
            body = body || "";

            var new_note = new models.Note(
                { title: title, body: body }
            );
            var editor = new NoteEditorView({
                model: new_note, 
                collection: this.notes,
                appview: this,
                is_new: true
            });
            this.$('> header').after(editor.el);
            editor.render().delegateEvents();
        },

        // #### Schedule a delayed save
        // Repeated calls while a timer is in progress will be ignored.
        scheduleSave: function () {
            var self = arguments.callee,
                $this = this;
            if (self.timer) { return; }
            self.timer = setTimeout(function () {
                self.timer = null;
                $this.saveChanges();
            }, this.options.save_delay);
        },

        // #### Save changes to the article.
        saveChanges: function (ev) {
            var src = this.notes.extractHTMLSource(),
                url = document.location.href,
                path = $.twFile.convertUriToLocalPath(url);
            $.twFile.save(path, src);
        },

        // #### Handle a click on an internal link.
        linkClick: function (ev) {
            var target = $(ev.target),
                href = target.attr('href');

            if (!href) { return true; }
            
            var name = href.substr(1);
                section = this.sectionByNameOrID(name);
                
            if (section.length) {
                // Reveal the section corresponding to the link.
                this.getNoteView(section).reveal();
            } else {
                // Pop open a new note with the given link.
                return this.newNote(ev, target.text());
            }

            return true;
        },

        // #### Toggle whether to autosave on each model change.
        toggleAutosave: function (ev) {
            var target = $(ev.target),
                autosave = target.is(':checked');
            this.options.autosave = autosave;
        }

    }, {
        
        // #### Empty DOM template for note controls
        CONTROLS_TMPL: [
            '<menu class="ui-only controls"><ul>',
                '<li><input type="checkbox" id="autosave">',
                    '<label for="autosave">Auto save&nbsp;</label></li>',
                '<li><button class="newNote">New note</button></li>',
                '<li><button class="saveChanges">Save changes</button></li>',
            '</ul></menu>'
        ].join('')

    });


    // ### View wrapper for DOM notes.
    var NoteView = Backbone.View.extend({

        tagName: 'section', className: 'note',
        events: {
            "dblclick": "revealEditor",
            "click .edit": "revealEditor",
            "click .hideOthers": "hideOthers",
            "click .hide": "hide"
        },

        // #### Update the DOM for a note
        render: function () {
            utils.updateElementFromModel($(this.el), this.model);
            this.enableControls();
            this.highlightMissingLinks();
            return this;
        },

        // #### Highlight mising internal links.
        highlightMissingLinks: function () {
            var $this = this;
            this.$("a[href^=#]").each(function (idx, el) {
                var link = $(el),
                    href = link.attr('href'),
                    name = href.substr(1),
                    section = $this.options.appview.sectionByNameOrID(name);
                link[((section.length) ? 'remove' : 'add') + 'Class']('missingLink');
            });
            return this;
        },

        // #### Extract note data from the DOM
        serialize: function () {
            return utils.extractDataFromElement($(this.el), this.model);
        },
        
        // #### Reveal the note
        reveal: function (el) {
            var section = this.el,
                appview_options = this.options.appview.options,
                $this = this;
            var final_fn = function () { 
                section.addClass('revealed').removeAttr('style'); 
                $this.highlightMissingLinks();
            };
            if (appview_options.animations) {
                section.fadeIn(appview_options.fade_time, final_fn);
            } else {
                final_fn();
            }
        },

        // #### Hide this note
        hide: function () {
            var section = this.el,
                appview_options = this.options.appview.options;
            var final_fn = function () {
                section.removeClass('revealed').removeAttr('style');
            };
            if (appview_options.animations) {
                section.fadeOut(appview_options.fade_time, final_fn);
            } else {
                final_fn();
            }
        },

        // #### Hide all other notes but this one
        hideOthers: function () {
            var $this = this,
                exclude_id = this.el.attr('id');
            this.options.appview.$('> section').each(function (idx, el) {
                if (el.id != exclude_id) {
                    $this.options.appview.getNoteView(el.id).hide();
                }
            });
        },

        // #### Create and reveal an editor for this note
        revealEditor: function () {
            var editor = new NoteEditorView({
                model: this.model, 
                collection: this.collection,
                appview: this.options.appview
            });
            $(this.el).addClass('editing').after(editor.el);
            editor.render().delegateEvents();
            return false;
        },

        // #### Enable controls for the note
        enableControls: function () {
            if (this.$('menu.controls').length === 0) {
                this.$('hgroup').before(NoteView.CONTROLS_TMPL);
                this.delegateEvents();
            }
            return false;
        }

    }, {
        
        // #### Empty DOM template for note controls
        CONTROLS_TMPL: [
            '<menu class="ui-only controls"><ul>',
                '<li><button class="edit">Edit</button></li>',
                '<li><button class="hideOthers">Hide Others</button></li>',
                '<li><button class="hide">Hide</button></li>',
            '</ul></menu>'
        ].join('')

    });


    // ### View for note editing
    var NoteEditorView = Backbone.View.extend({
        tagName: 'div', className: 'note-editor ui-only',

        events: {
            "submit form": "commit",
            "click button.save": "commit",
            "click button.cancel": "close",
            "click button.delete": "del"
        },
        
        // #### Update the editor fields from the related model.
        render: function () {
            var data = this.model.toJSON();
            
            $(this.el)
                .data('view', this)
                .html(NoteEditorView.EDITOR_TMPL);

            // Hide the delete button if this is a new note.
            if (this.options.is_new) {
                this.$('button.delete').hide();
            } else {
                $(this.el).attr('data-model-id', data.id);
            }

            this.$('h2').text(data.title);
            this.$('*[name=title]').val(data.title).select().focus();
            this.$('*[name=body]').val(data.body);

            return this;
        },

        // #### Extract data from editor fields.
        serialize: function () {
            data = {
                title: this.$('*[name=title]').val(),
                body: this.$('*[name=body]').val()
            };
            data.body = this.model.filterBody(data.body);
            return data;
        },

        // #### Close the editor, reveal the underlying note view.
        close: function () {
            var editor_el = $(this.el);
            editor_el.remove();
            if (!this.options.is_new) {
                var display_view = this.options.appview.getNoteView(this.model.id);
                if (display_view) {
                    $(display_view.el).removeClass('editing');
                    display_view.render().reveal();
                }
            }
            return false; 
        },

        // #### Commit the state of the editor to the related model.
        commit: function () {
            var $this = this,
                data = this.serialize();

            if (!this.options.is_new) {
                
                this.model.save(data, {
                    success: function (model, resp) { $this.close(); },
                    error: function (model, resp, options) { }
                });

            } else {
                
                this.collection.create(data, {
                    success: function (model, resp) { 
                        $this.options.is_new = false;
                        $this.model = model;
                        $this.close(); 
                    },
                    error: function (model, resp, options) { }
                });

            }
            return false;
        },

        // #### Delete the underlying note
        del: function () {
            var $this = this,
                appview_options = this.options.appview.options;
            var result = (!appview_options.confirm_delete) ? true :
                window.confirm("Are you sure you want to delete "+
                               "'"+this.model.get('title')+"'?");
            if (result) {
                this.model.destroy({
                    success: function (model, resp) { $this.close(); },
                    error: function (model, resp, options) { }
                });
            }
            return false; 
        }

    }, {
        
        // #### Template for the innerHTML of the editor div
        // TODO: Move this into an external asset? l10n?
        EDITOR_TMPL: [
            '<h2></h2>',
            '<form><fieldset>',
                '<ul>',
                    '<li class="field"><label>Title</label>',
                        '<input type="text" name="title" size="50" /></li>',
                    '<li class="field"><label>Body</label>',
                        '<textarea name="body" cols="50" rows="10"></textarea></li>',
                '</ul>',
            '</fieldset></form>',
            '<menu class="controls">',
                '<button class="delete">Delete</button>',
                '<button class="save">Save</button>',
                '<button class="cancel">Cancel</button>',
            '</menu>'
        ].join('')

    });

    return {
        AppView: AppView,
        NoteView: NoteView,
        NoteEditorView: NoteEditorView
    };

});
