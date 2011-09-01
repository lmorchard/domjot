//
// ## domjot tests
//
require(["jquery", "domjot"], function ($, domjot) {
    QUnit.init();

    window.domjot = domjot;

    var coll = domjot.models.notes;

    // Make lots of noise on all collection and model events
    coll.bind("all", function (event_name) {
        console.log("COLL EVENT " + event_name);
        console.log(arguments);
    });
    coll.bind("reset", function () {
        coll.each(function (model, idx) {
            model.bind("all", function (event_name) {
                console.log("MODEL EVENT " + event_name);
                console.log(arguments);
            });
        });
        console.log("COLL RESET");
        console.log(arguments);
    });
    coll.bind("add", function (model, collection, options) {
        model.bind("all", function (event_name) {
            console.log("MODEL EVENT " + event_name);
            console.log(arguments);
        });
    });

    test('DOM sections should appear as Notes in NoteCollection', function () {
        async.series([
            function (next) {
                stop();
                coll.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                start();
                equals(coll.length, $('article > section').length,
                    "Collection should contain the same number of notes as sections");
                coll.each(function (note, idx) {
                    var section = $('article > section[id="'+note.id+'"]');
                    equals(section.length, 1,
                        "There should be a section matching "+note.id);
                    equals(note.get('title'), section.find('hgroup > h2').text(),
                        "Note title should match section title");
                });
            }
        ]);
    });

    test('Changing Notes should result in DOM section changes', function () {

        var test_data = [
            ['note-0', { 
                'title': 'Note #1 for testing',
                'body': '<p><b>First edited note</b></p>'
            }],
            ['note-1', {
                'title': 'Note #3 for testing',
                'body': '<p><b>Third edited note</b></p>'
            }],
            ['note-2', {
                'title': 'Note #4 for testing',
                'body': '<p><b>Fourth edited note</b></p>'
            }]
        ];

        async.series([
            function (next) {
                stop(100);
                coll.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                start(); stop(100);
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
                start(); stop(100);
                coll.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                start();
                for (var i=0,item; item=test_data[i]; i++) {
                    var note_id = item[0], 
                        data = item[1], 
                        note = coll.get(note_id),
                        section = $('article > section[id="'+note.id+'"]');
                    equals(section.length, 1,
                        "There should be a section matching "+note.id);
                    equals(data['title'], note.get('title'),
                        "Note title should match section title");
                    equals(note.get('title'), section.find('hgroup > h2').text(),
                        "Note title should match section title");
                }
            }
        ]);
    
    });

    test('Creating Notes should result in new DOM sections', function () {

        var test_data = [
            { 'title': 'New Note 1',
                'body': '<p>First new one</p>' },
            { 'title': 'New Note 2',
                'body': '<p>Second new one</p>' },
            { 'title': 'New Note 3',
                'body': '<p>Third new one</p>' },
            { 'title': 'New Note 4',
                'body': '<p>Fourth new one</p>' }
        ];

        var new_notes = null;

        async.series([
            function (next) {
                stop(100);
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
                start(); stop(100);
                coll.fetch({
                    success: function () { next(); }
                });
            },
            function (next) {
                start();
                for (var i=0,note; note=new_notes[i]; i++) {
                    var section = $('article > section[id="'+note.id+'"]');
                    equals(section.length, 1,
                        "There should be a section matching "+note.id);
                    equals(note.get('title'), section.find('hgroup > h2').text(),
                        "Note title should match section title");
                }
            }
        ]);
    });

    QUnit.start();
});
