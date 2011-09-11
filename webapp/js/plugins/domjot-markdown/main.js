//
// ## domjot markdown editor plugin
//
define(["jquery", "underscore", "backbone", "domjot/plugins", 
        "domjot-markdown/showdown", 
        "domjot-markdown/jquery.taboverride"],
function ($, _, Backbone, Plugins, Showdown, tabOverride) {

    // ### Metadata for plugin
    var meta = {
        id: "domjot-markdown",
        title: "Markdown",
        description: [
            "Support editing of notes using Markdown"
        ].join(' ')
    };

    // ### Plugin class
    var Plugin = Plugins.Plugin.extend({

        EDITOR_FIELD_TMPL: [
            '<li class="field body_markdown">',
                '<label>Body (markdown)</label>',
                '<textarea name="body_markdown" cols="50" rows="10" ',
                    'style="font: 0.9em monospace; height: 25em"></textarea>',
            '</li>'
        ].join(''),

        EDITOR_CONTROLS_TMPL: [
            '<li class="field editor_select">',
                '<label>Editor select</label>',
                '<menu>',
                    '<button name="markdown">Markdown</button>',
                    '<button name="html">HTML</button>',
                '</menu>',
            '</li>'
        ].join(''),

        events: {
            'appview editor:render': 'handleEditorRender',
            'appview editor:serialize': 'handleEditorSerialize'
        },

        // #### Handle note editor rendering
        // Inject the markdown editing UI on note editor rendering
        handleEditorRender: function (app_view, editor_view) {

            // Build the markdown content editor field.
            // TODO: Stick this in CSS somewhere
            var markdown_body = $(this.EDITOR_FIELD_TMPL);
            var markdown_controls = $(this.EDITOR_CONTROLS_TMPL);

            // Inject the markdown editor into the note editor.
            editor_view.$('li.field.title')
                .after(markdown_body)
                .after(markdown_controls);

            // Make tabs work better in the markdown field.
            $.fn.tabOverride.setTabSize(4);
            $.fn.tabOverride.autoIndent = true;
            markdown_body.find('*[name="body_markdown"]').tabOverride();

            // If this note is not new, try getting markdown source from the
            // hidden element.
            if (!editor_view.options.is_new) {
                var md_src = editor_view.options.note_view.$('.markdown_src').text();
                editor_view.$('*[name="body_markdown"]').val(md_src);
            }

            // Quick and dirty editor switcher
            editor_view.$('*[name="body"]').hide();
            markdown_controls.find('button[name="markdown"]').click(function (ev) {
                editor_view.$('.field.body_markdown').show();
                editor_view.$('*[name="body"]').hide();
                return false;
            });
            markdown_controls.find('button[name="html"]').click(function (ev) {
                editor_view.$('.field.body_markdown').hide();
                editor_view.$('*[name="body"]').show();
                return false;
            });

        },
        
        // #### Handle note editor data extraction
        // When the editor is serialized to model data, handle the markdown
        // content management.
        handleEditorSerialize: function (app_view, editor_view, data) {

            // Grab the Markdown source from the editor, convert to HTML.
            var src = editor_view.$('$[name=body_markdown]').val(),
                md = new Showdown.converter(),
                html = editor_view.options.model.filterBody(md.makeHtml(src));

            // Wrap the incoming note HTML in an element, attempt to find the
            // elements holding rendered content and markdown source.
            var new_body = $('<div>' + data.body + '</div>'),
                body_el = new_body.find('.markdown'),
                src_el = new_body.find('.markdown_src');

            // If rendered markdown wasn't found, inject new empty element.
            if (0 === body_el.length) {
                body_el = $('<div class="markdown"></div>');
                new_body.append(body_el);
            }

            // If markdown source wasn't found, inject new empty element.
            if (0 === src_el.length) {
                src_el = $('<pre class="markdown_src" style="display: none"></pre>');
                new_body.append(src_el);
            }

            // Fill in the rendered content
            body_el.html(html);

            // Fill in the markdown source
            src_el.text(src);

            // Turn the DOM structure back into HTML source and serialize.
            data.body = new_body.html();
        
        }
        
    }, meta);

    return Plugins.registry.register(Plugin);
});
