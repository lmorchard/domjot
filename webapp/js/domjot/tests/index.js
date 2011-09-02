//
// ## domjot tests
//
require(["extlib/jquery", "domjot/models", "domjot/views",
        "domjot/controllers"], 
        function (i0, domjot_models, domjot_views, domjot_controllers) {
    var $ = jQuery;

    window.domjot_models = domjot_models;
    window.domjot_controllers = domjot_controllers;

    QUnit.init();

    var coll = domjot_models.notes;

    /*
    // Make lots of noise on all collection and model events
    coll.bind("all", function (event_name) {
        console.log("COLL EVENT", event_name, arguments);
    });
    coll.bind("reset", function () {
        coll.each(function (model, idx) {
            model.bind("all", function (event_name) {
                console.log("MODEL EVENT", event_name, arguments);
            });
        });
        console.log("COLL RESET");
        console.log(arguments);
    });
    coll.bind("add", function (model, collection, options) {
        model.bind("all", function (event_name) {
            console.log("MODEL EVENT", event_name, arguments);
        });
    });
    */

    asyncTest('DOM sections should appear as Notes in NoteCollection', function () {
        async.series([
            function (next) {
                coll.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                equals(coll.length, $('article > section').length,
                    "Collection should contain the same number of notes as sections");
                coll.each(function (note, idx) {
                    var section = $('article > section[id="'+note.id+'"]');
                    equals(section.length, 1,
                        "There should be a section matching "+note.id);
                    equals(note.get('title'), section.find('hgroup > h2').text(),
                        "Note title should match section title");
                });
                start();
            }
        ]);
    });

    asyncTest('Changing Notes should result in DOM section changes', function () {

        var test_data = [
            ['note-0', { 
                'title': 'Note #1 for testing',
                'body': '<p><b>First edited note</b></p>'
            }],
            ['note-1', {
                'title': 'Note #2 for testing',
                'body': '<p><b>Third edited note</b></p>'
            }],
            ['note-2', {
                'title': 'Note #3 for testing',
                'body': '<p><b>Fourth edited note</b></p>'
            }]
        ];

        async.series([
            function (next) {
                coll.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                async.forEach(test_data, function (item, fe_next) {
                    var note_id = item[0], 
                        data = item[1], 
                        note = coll.get(note_id);
                    note.save(data, {
                        success: function () { fe_next(); }
                    });
                }, function (err) {
                    next(err);
                });
            },
            function (next) {
                coll.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                for (var i=0; i<test_data.length; i++) {
                    var item = test_data[i],
                        note_id = item[0], 
                        data = item[1], 
                        note = coll.get(note_id),
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
                    coll.create(data, { 
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
                coll.fetch({
                    success: function () { next(); }
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

    asyncTest('Edit button in note should reveal an editor, cancel button should close', function () {
        async.series([
            function (next) {
                var controller = new domjot_controllers.MainController({
                    article: $('article.domjot'),
                    success: function() { next(); }
                });
                window.controller = controller;
            },
            function (next) {
                // Click the edit button, ensure the editor appears.
                $('article > section#note-0 .controls .edit').click();
                equals($('div.note-editor[data-model-id=note-0]').length, 1);
                // Click the cancel button, ensure the editor goes away.
                $('div.note-editor[data-model-id=note-0] .controls .cancel').click();
                equals($('div.note-editor[data-model-id=note-0]').length, 0);
                start();
            }
        ]);
    });

    asyncTest('Save button in editor should commit changes to model', function () {

        var controller;
        var note_id = 'edit-with-ui';
        var test_data = {
            title: "Title edited in UI",
            body: "<p><em>This body was edited in the UI</em></p>"
        };

        async.series([
            function (next) {
                // Fire up a controller, which enables note controls.
                controller = new domjot_controllers.MainController({
                    article: $('article.domjot'),
                    success: function() { next(); }
                });
            },
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

                // Force-refresh the model, make sure changes are found
                domjot_models.notes.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                // Ensure the editor changes are reflected in the model.
                var note = domjot_models.notes.get(note_id);
                equals(note.get('title'), test_data.title);
                equals(note.get('body'), test_data.body);
                start();
            }
        ]);
    });

    asyncTest('Delete button in editor should delete from model', function () {

        var controller;
        var note_id = 'delete-with-ui';

        async.series([
            function (next) {
                // Fire up a controller, which enables note controls.
                controller = new domjot_controllers.MainController({
                    article: $('article.domjot'),
                    success: function() { next(); }
                });
            },
            function (next) {
                // Click the edit button
                $('article > section#'+note_id+' .controls .edit').click();

                var editor_el = $('div.note-editor[data-model-id='+note_id+']');
                var editor_view = editor_el.data('view');
                editor_view.confirm_delete = false;

                // Click the save button, ensure the editor has gone away.
                editor_el.find('.controls .delete').click();
                equals($('div.note-editor[data-model-id='+note_id+']').length, 0);

                // Force-refresh the model, make sure changes are found
                domjot_models.notes.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                // Ensure the editor changes are reflected in the model.
                var note = domjot_models.notes.get(note_id);
                equals(typeof note, 'undefined');
                start();
            }
        ]);
    });

    QUnit.start();
});
