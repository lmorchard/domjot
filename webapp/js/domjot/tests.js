//
// ## domjot tests
//
require(["extlib/jquery", "domjot/models", "domjot/views"], 
        function (i0, domjot_models, domjot_views) {
    var $ = jQuery;

    window.domjot_models = domjot_models;
    window.domjot_views = domjot_views;

    require.ready(function () {
        window.appview = new domjot_views.AppView({ 
            success: function(appview) { 
                run_tests(domjot_models, domjot_views, appview); 
            }
        });
    });
});

function run_tests(domjot_models, domjot_views, appview) {
    QUnit.init();

    var notes = appview.notes;

    // Make lots of noise on all notesection and model events
    notes.bind("all", function (event_name) {
        console.log("COLL ALL", event_name, arguments);
    });
    notes.bind("reset", function () {
        console.log("COLL RESET", arguments);
        notes.each(function (model, idx) {
            model.bind("all", function (event_name) {
                console.log("MODEL ALL", event_name, arguments);
            });
        });
    });
    notes.bind("add", function (model, notesection, options) {
        console.log("COLL ADD", arguments);
        model.bind("all", function (event_name) {
            console.log("MODEL EVENT", event_name, arguments);
        });
    });


    test('DOM sections should appear as Notes in section', function () {
        equals(notes.length, $('article > section').length,
            "notesection should contain the same number of notes as sections");
        notes.each(function (note, idx) {
            var section = $('article > section[id="'+note.id+'"]');
            equals(section.length, 1,
                "There should be a section matching "+note.id);
            equals(note.get('title'), section.find('hgroup > h2').text(),
                "Note title should match section title");
        });
    });


    asyncTest('Changing Notes should result in DOM section changes', 
            function () {

        // The model-assigned IDs might be unpredictable, but they at least
        // have a note- prefix.
        var ids = $('section.test-edit')
            .map(function () { return $(this).attr('id'); })
            .get();

        var test_data = [
            [ids[0], { 
                'title': 'Note #1 for testing',
                'body': '<p><b>First edited note</b></p>'
            }],
            [ids[1], {
                'title': 'Note #2 for testing',
                'body': '<p><b>Third edited note</b></p>'
            }],
            [ids[2], {
                'title': 'Note #3 for testing',
                'body': '<p><b>Fourth edited note</b></p>'
            }]
        ];

        async.series([
            function (next) {
                async.forEach(test_data, function (item, fe_next) {
                    var note_id = item[0], 
                        data = item[1], 
                        note = notes.get(note_id);
                    note.save(data, {
                        success: function () { fe_next(); }
                    });
                }, function (err) {
                    next(err);
                });
            },
            function (next) {
                for (var i=0; i<test_data.length; i++) {
                    var item = test_data[i],
                        note_id = item[0], 
                        data = item[1], 
                        note = notes.get(note_id),
                        section = $('article > section[id="'+note.id+'"]');
                    equals(section.length, 1,
                        "There should be a section matching "+note.id);
                    equals(data.title, note.get('title'),
                        "Note title should match section title");
                    equals(note.get('title'), section.find('hgroup > h2').text(),
                        "Note title should match section title");
                }
                start();
            }
        ]);
    
    });


    asyncTest('Creating Notes should result in new DOM sections', function () {

        var test_data = [
            { 'title': 'New Note 1',
                'body': '<p>First new one</p>' },
            { 'title': 'New Note 2',
                'body': '<p>Second new one</p>' },
            { 'title': 'New Note 3',
                'body': '<p>Third new one</p>' }
        ];

        var new_notes = null;

        async.series([
            function (next) {
                async.map(test_data, function (data, fe_next) {
                    notes.create(data, { 
                        success: function (model) {
                            fe_next(null, model); 
                        }
                    });
                }, function (err, results) { 
                    new_notes = results;
                    next();
                });
            },
            function (next) {
                for (var i=0; i<new_notes.length; i++) {
                    var note = new_notes[i];
                    var section = $('article > section[id="'+note.id+'"]');
                    equals(section.length, 1,
                        "There should be a section matching "+note.id);
                    equals(note.get('title'), section.find('hgroup > h2').text(),
                        "Note title should match section title");
                }
                start();
            }
        ]);
    });


    test('Edit button in note should reveal an editor, cancel button should close', function () {
        var note_id = 'note-1';

        // Click the edit button, ensure the editor appears.
        $('article > section#'+note_id+' .controls .edit').click();
        equals($('div.note-editor[data-model-id='+note_id+']').length, 1);

        // Click the cancel button, ensure the editor goes away.
        $('div.note-editor[data-model-id='+note_id+'] .controls .cancel').click();
        equals($('div.note-editor[data-model-id='+note_id+']').length, 0);
    });


    asyncTest('Save button in editor should commit changes to model', function () {

        var note_id = $('section.test-edit-ui').attr('id');
        var test_data = {
            title: "Title edited in UI",
            body: "<p><em>This body was edited in the UI</em></p>"
        };

        async.series([
            function (next) {
                // Click the edit button
                $('article > section#'+note_id+' .controls .edit').click();

                // Fill in the editor fields.
                var editor_el = $('div.note-editor[data-model-id='+note_id+']');
                editor_el.find('*[name=title]').val(test_data.title);
                editor_el.find('*[name=body]').val(test_data.body);
                
                // Click the save button, ensure the editor has gone away.
                $('div.note-editor[data-model-id='+note_id+'] .controls .save').click();
                equals($('div.note-editor[data-model-id='+note_id+']').length, 0);

                next();
            },
            function (next) {
                // Ensure the editor changes are reflected in the model.
                var note = notes.get(note_id);
                equals(note.get('title'), test_data.title);
                equals(note.get('body'), test_data.body);
                start();
            }
        ]);
    });


    asyncTest('Delete button in editor should delete from model', function () {

        var note_id = $('section.test-delete-ui').attr('id');

        async.series([
            function (next) {
                // Click the edit button
                $('article > section#'+note_id+' .controls .edit').click();

                var editor_el = $('div.note-editor[data-model-id='+note_id+']');
                var editor_view = editor_el.data('view');
                editor_view.confirm_delete = false;

                // Click the save button, ensure the editor has gone away.
                editor_el.find('.controls .delete').click();
                equals($('div.note-editor[data-model-id='+note_id+']').length, 0);

                next();
            },
            function (next) {
                // Ensure the editor changes are reflected in the model.
                var note = notes.get(note_id);
                equals(typeof note, 'undefined');
                start();
            }
        ]);
    });


    QUnit.start();
}
